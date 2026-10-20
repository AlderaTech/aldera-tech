import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { queryRouter } from "@/lib/router-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

interface SubsystemCheck {
  status: "up" | "down";
  latencyMs?: number;
  error?: string;
  [key: string]: unknown;
}

interface StorageCheck extends SubsystemCheck {
  writable: boolean;
  path: string;
}

interface UpstreamCheck extends SubsystemCheck {
  url: string;
}

/**
 * 1. Checks primary Web PostgreSQL database connectivity via Prisma $queryRaw.
 */
async function checkPrimaryDatabase(): Promise<SubsystemCheck> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1;`;
    return {
      status: "up",
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      status: "down",
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * 2. Checks secondary Router PostgreSQL database connectivity via queryRouter.
 */
async function checkRouterDatabase(): Promise<SubsystemCheck> {
  const start = Date.now();
  try {
    await queryRouter("SELECT 1;");
    return {
      status: "up",
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      status: "down",
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * 3. Checks Upload Storage read/write/unlink permissions in public/uploads.
 */
async function checkUploadStorage(): Promise<StorageCheck> {
  const start = Date.now();
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  let probePath: string | null = null;
  try {
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    probePath = path.join(
      uploadsDir,
      `.health-probe-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.tmp`
    );
    await fs.promises.writeFile(probePath, "probe-ok", "utf8");
    await fs.promises.stat(probePath);
    await fs.promises.unlink(probePath);
    probePath = null;
    return {
      status: "up",
      writable: true,
      path: uploadsDir,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    if (probePath) {
      try {
        await fs.promises.unlink(probePath);
      } catch {
        // ignore probe unlink error during recovery
      }
    }
    return {
      status: "down",
      writable: false,
      path: uploadsDir,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * 4. Checks Upstream 9router reachability (GET /v1/models with 2s timeout).
 */
async function checkUpstreamRouter(): Promise<UpstreamCheck> {
  const start = Date.now();
  const rawBaseUrl =
    process.env.NINE_ROUTER_BASE_URL || "http://localhost:20128";
  const upstreamUrl = `${rawBaseUrl.replace(/\/+$/, "")}/v1/models`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const apiKey = process.env.NINE_ROUTER_API_KEY?.trim();
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  try {
    const res = await fetch(upstreamUrl, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(2000),
    });

    const latencyMs = Date.now() - start;

    if (!res.ok) {
      return {
        status: "down",
        latencyMs,
        url: upstreamUrl,
        error: `Upstream returned HTTP ${res.status}: ${res.statusText}`,
      };
    }

    return {
      status: "up",
      latencyMs,
      url: upstreamUrl,
    };
  } catch (err) {
    const latencyMs = Date.now() - start;
    const hasCode = typeof err === "object" && err !== null && "code" in err;
    const errorCode = hasCode ? (err as { code: unknown }).code : undefined;
    const isTimeout =
      (err instanceof Error &&
        (err.name === "TimeoutError" || err.name === "AbortError")) ||
      errorCode === "ETIMEDOUT";

    return {
      status: "down",
      latencyMs,
      url: upstreamUrl,
      error: isTimeout
        ? "Upstream 9router request timed out (2000ms exceeded)"
        : err instanceof Error
        ? err.message
        : String(err),
    };
  }
}

/**
 * GET /api/health
 *
 * Deep health check validating 4 critical subsystems:
 * - Primary Web DB (Prisma SELECT 1)
 * - Secondary Router DB (queryRouter SELECT 1)
 * - Upload Storage (probe file write/read/unlink)
 * - Upstream 9router reachability (/v1/models with 2s timeout)
 *
 * Returns:
 * - HTTP 200: all subsystems operational (status: "healthy")
 * - HTTP 503: one or more subsystems degraded/down (status: "unhealthy")
 */
export async function GET() {
  const overallStart = Date.now();

  const [primaryDb, routerDb, storage, upstream] = await Promise.all([
    checkPrimaryDatabase(),
    checkRouterDatabase(),
    checkUploadStorage(),
    checkUpstreamRouter(),
  ]);

  const allHealthy =
    primaryDb.status === "up" &&
    routerDb.status === "up" &&
    storage.status === "up" &&
    upstream.status === "up";

  const totalDurationMs = Date.now() - overallStart;

  const body = {
    status: allHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    durationMs: totalDurationMs,
    ...(allHealthy
      ? {}
      : {
          error: "One or more critical subsystems failed health verification",
        }),
    checks: {
      primaryDatabase: primaryDb,
      routerDatabase: routerDb,
      storage: storage,
      uploadStorage: storage,
      upstreamRouter: upstream,
      upstream9router: upstream,
    },
  };

  return NextResponse.json(body, {
    status: allHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function HEAD() {
  return GET();
}
