/**
 * Scheduled blog publisher cron endpoint.
 *
 * Run every 15 minutes via crontab:
 *   *\/15 * * * *  curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/publish-scheduled
 *
 * Behavior:
 *   - Finds BlogPost rows with published=false AND scheduledAt <= now
 *   - Sets published=true, publishedAt=now, clears scheduledAt
 *   - Revalidates /blog + each post slug
 */
import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { verifyCronSecret } from "@/lib/cron";
import { withCronLock } from "@/lib/cron-lock";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const authResult = verifyCronSecret(req);
  if (!authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error ?? "Unauthorized" },
      { status: 401 }
    );
  }

  const lockRes = await withCronLock("publish-scheduled", async () => {
    const now = new Date();
    const due = await prisma.blogPost.findMany({
      where: {
        published: false,
        scheduledAt: { not: null, lte: now },
      },
      select: { id: true, slug: true, title: true },
    });

    const results: Array<{
      id: string;
      slug: string;
      ok: boolean;
      error?: string;
    }> = [];

    for (const post of due) {
      try {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: {
            published: true,
            publishedAt: now,
            scheduledAt: null,
          },
        });
        revalidatePath(PUBLIC_ROUTES.blog);
        revalidatePath(PUBLIC_ROUTES.blogPost(post.slug));
        results.push({ id: post.id, slug: post.slug, ok: true });
      } catch (err) {
        results.push({
          id: post.id,
          slug: post.slug,
          ok: false,
          error: (err as Error).message,
        });
      }
    }

    return {
      published: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
      timestamp: now.toISOString(),
    };
  });

  if (!lockRes.executed) {
    return NextResponse.json(
      {
        skipped: true,
        reason: lockRes.reason ?? "Job already running",
      },
      { status: 200 }
    );
  }

  if (lockRes.error) {
    console.error("[Cron: publish-scheduled] Execution failed:", lockRes.error);
    return NextResponse.json(
      {
        success: false,
        error: lockRes.error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(lockRes.result);
}
