import { NextResponse, type NextRequest } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InvoicePdf, type InvoicePdfData } from "@/lib/pdf/invoice-template";
import { formatCurrency, formatDate } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true, items: { orderBy: { order: "asc" } } },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Clients can only download their own
  if (
    session.user.role !== "ADMIN" &&
    invoice.clientId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data: InvoicePdfData = {
    number: invoice.number,
    issueDate: formatDate(invoice.issueDate),
    dueDate: formatDate(invoice.dueDate),
    status: invoice.status,
    currency: invoice.currency,
    client: {
      name: invoice.client.name,
      email: invoice.client.email,
      company: invoice.client.company,
      phone: invoice.client.phone,
    },
    items: invoice.items.map((it) => ({
      description: it.description,
      quantity: Number(it.quantity).toLocaleString("id-ID"),
      price: formatCurrency(Number(it.price)),
      total: formatCurrency(Number(it.total)),
    })),
    subtotal: formatCurrency(Number(invoice.subtotal)),
    taxRate: Number(invoice.taxRate).toString(),
    taxAmount: formatCurrency(Number(invoice.taxAmount)),
    total: formatCurrency(Number(invoice.total)),
    notes: invoice.notes,
  };

  const stream = await renderToStream(<InvoicePdf invoice={data} />);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk as Buffer | Uint8Array));
  }
  const buffer = Buffer.concat(chunks);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
