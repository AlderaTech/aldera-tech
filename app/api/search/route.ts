import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, isStaff, PERMISSIONS } from "@/lib/permissions";
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";

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

  const roles =
    session.user.roles ?? (session.user.role ? [session.user.role] : []);
  const staff = isStaff(roles);

  const results: SearchResult[] = [];

  try {
    if (staff) {
      const canViewProjects = hasPermission(
        roles,
        PERMISSIONS.PROJECT_VIEW_ALL
      );
      const canViewInvoices = hasPermission(roles, PERMISSIONS.INVOICE_VIEW);
      const canViewUsers = hasPermission(roles, PERMISSIONS.USER_MANAGE);
      const canViewBlog = hasPermission(roles, PERMISSIONS.BLOG_VIEW);

      const [projects, invoices, users, posts] = await Promise.all([
        canViewProjects
          ? prisma.project.findMany({
              where: {
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                ],
              },
              take: 5,
              select: {
                id: true,
                title: true,
                client: { select: { name: true } },
              },
            })
          : Promise.resolve([]),
        canViewInvoices
          ? prisma.invoice.findMany({
              where: { number: { contains: q, mode: "insensitive" } },
              take: 5,
              select: {
                id: true,
                number: true,
                client: { select: { name: true } },
              },
            })
          : Promise.resolve([]),
        canViewUsers
          ? prisma.user.findMany({
              where: {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { email: { contains: q, mode: "insensitive" } },
                ],
              },
              take: 5,
              select: { id: true, name: true, email: true, roles: true },
            })
          : Promise.resolve([]),
        canViewBlog
          ? prisma.blogPost.findMany({
              where: { title: { contains: q, mode: "insensitive" } },
              take: 5,
              select: { id: true, title: true, slug: true, published: true },
            })
          : Promise.resolve([]),
      ]);

      for (const p of projects) {
        results.push({
          kind: "project",
          id: p.id,
          title: p.title,
          subtitle: p.client.name,
          href: ADMIN_ROUTES.projectDetail(p.id),
        });
      }
      for (const inv of invoices) {
        results.push({
          kind: "invoice",
          id: inv.id,
          title: inv.number,
          subtitle: inv.client.name,
          href: ADMIN_ROUTES.invoiceDetail(inv.id),
        });
      }
      for (const u of users) {
        results.push({
          kind: "user",
          id: u.id,
          title: u.name,
          subtitle: `${u.email} · ${u.roles.join(", ")}`,
          href: ADMIN_ROUTES.users,
        });
      }
      for (const p of posts) {
        results.push({
          kind: "blog",
          id: p.id,
          title: p.title,
          subtitle: p.published ? "Published" : "Draft",
          href: ADMIN_ROUTES.blogEdit(p.id),
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
          href: DASHBOARD_ROUTES.projectDetail(p.id),
        });
      }
      for (const inv of invoices) {
        results.push({
          kind: "invoice",
          id: inv.id,
          title: inv.number,
          href: DASHBOARD_ROUTES.invoices,
        });
      }
    }
  } catch (err) {
    console.error("Search error:", err);
  }

  return NextResponse.json({ results });
}
