import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";

export const runtime = "nodejs";

type SearchResult = {
  kind: "project" | "invoice" | "user" | "blog";
  id: string;
  title: string;
  subtitle?: string | null;
  href: string;
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ results: [] });

  const userRole = session.user.role;
  const staff = isStaff(userRole);

  const results: SearchResult[] = [];

  try {
    if (staff) {
      const [projects, invoices, users, posts] = await Promise.all([
        prisma.project.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 5,
          select: { id: true, title: true, client: { select: { name: true } } },
        }),
        prisma.invoice.findMany({
          where: { number: { contains: q, mode: "insensitive" } },
          take: 5,
          select: {
            id: true,
            number: true,
            client: { select: { name: true } },
          },
        }),
        prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { company: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 5,
          select: { id: true, name: true, email: true, role: true },
        }),
        prisma.blogPost.findMany({
          where: { title: { contains: q, mode: "insensitive" } },
          take: 5,
          select: { id: true, title: true, slug: true, published: true },
        }),
      ]);

      for (const p of projects) {
        results.push({
          kind: "project",
          id: p.id,
          title: p.title,
          subtitle: p.client.name,
          href: `/admin/projects/${p.id}`,
        });
      }
      for (const inv of invoices) {
        results.push({
          kind: "invoice",
          id: inv.id,
          title: inv.number,
          subtitle: inv.client.name,
          href: `/admin/invoices/${inv.id}`,
        });
      }
      for (const u of users) {
        results.push({
          kind: "user",
          id: u.id,
          title: u.name,
          subtitle: `${u.email} · ${u.role}`,
          href: `/admin/users`,
        });
      }
      for (const p of posts) {
        results.push({
          kind: "blog",
          id: p.id,
          title: p.title,
          subtitle: p.published ? "Published" : "Draft",
          href: `/admin/blog/${p.id}/edit`,
        });
      }
    } else {
      // Client: search own projects + invoices
      const [projects, invoices] = await Promise.all([
        prisma.project.findMany({
          where: {
            clientId: session.user.id,
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 5,
          select: { id: true, title: true },
        }),
        prisma.invoice.findMany({
          where: {
            clientId: session.user.id,
            number: { contains: q, mode: "insensitive" },
          },
          take: 5,
          select: { id: true, number: true },
        }),
      ]);
      for (const p of projects) {
        results.push({
          kind: "project",
          id: p.id,
          title: p.title,
          href: `/dashboard/projects/${p.id}`,
        });
      }
      for (const inv of invoices) {
        results.push({
          kind: "invoice",
          id: inv.id,
          title: inv.number,
          href: `/dashboard/invoices`,
        });
      }
    }
  } catch (err) {
    console.error("Search error:", err);
  }

  return NextResponse.json({ results });
}
