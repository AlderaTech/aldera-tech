"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";
import {
  proposalCreateSchema,
  signatureSchema,
} from "@/lib/validations/proposal";
import { sendWhatsApp } from "@/lib/whatsapp";
import { waTemplates } from "@/lib/whatsapp-templates";
import { formatCurrency, formatDate } from "@/lib/utils";
import { logAudit } from "@/lib/actions/team";
import { ADMIN_ROUTES, PROPOSAL_ROUTES } from "@/lib/routes";
import { sanitizeHtml } from "@/lib/sanitize-html";

export type ProposalActionState = {
  ok: boolean;
  message?: string;
  proposalId?: string;
};

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session.user;
}

async function generateProposalNumber() {
  const year = new Date().getFullYear();
  const last = await prisma.proposal.findFirst({
    where: { number: { startsWith: `PROP-${year}-` } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const seq = last ? Number(last.number.split("-")[2] ?? 0) + 1 : 1;
  return `PROP-${year}-${String(seq).padStart(4, "0")}`;
}

export async function createProposalAction(
  _: ProposalActionState,
  formData: FormData
): Promise<ProposalActionState> {
  const user = await requireStaff();

  const itemsRaw = formData.get("items");
  let itemsParsed: unknown;
  try {
    itemsParsed = JSON.parse(String(itemsRaw ?? "[]"));
  } catch {
    return { ok: false, message: "Items tidak valid." };
  }

  const parsed = proposalCreateSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary") || "",
    content: formData.get("content"),
    clientName: formData.get("clientName"),
    clientEmail: formData.get("clientEmail"),
    clientPhone: formData.get("clientPhone") || "",
    taxRate: formData.get("taxRate") ?? "0",
    expiresAt: formData.get("expiresAt") || "",
    items: itemsParsed,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Input tidak valid.",
    };
  }
  const data = parsed.data;

  const subtotal = data.items.reduce((s, it) => s + it.quantity * it.price, 0);
  const tax = (subtotal * data.taxRate) / 100;
  const total = subtotal + tax;

  const number = await generateProposalNumber();
  // URL-safe token (not hashed, it's a public-view capability URL)
  const token = randomBytes(24).toString("base64url");

  const proposal = await prisma.proposal.create({
    data: {
      number,
      token,
      title: data.title,
      summary: data.summary || null,
      content: sanitizeHtml(data.content),
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone || null,
      taxRate: data.taxRate.toString(),
      totalAmount: total.toFixed(2),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      createdById: user.id,
      items: {
        create: data.items.map((it, idx) => ({
          description: it.description,
          quantity: it.quantity.toString(),
          price: it.price.toString(),
          total: (it.quantity * it.price).toFixed(2),
          order: idx,
        })),
      },
    },
    select: { id: true },
  });

  await logAudit(user.id, "PROPOSAL_CREATED", "Proposal", proposal.id);
  revalidatePath(ADMIN_ROUTES.proposals);
  return { ok: true, proposalId: proposal.id, message: "Proposal dibuat." };
}

export async function sendProposalAction(id: string) {
  const user = await requireStaff();
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    select: {
      id: true,
      number: true,
      title: true,
      clientName: true,
      clientEmail: true,
      clientPhone: true,
      token: true,
      totalAmount: true,
      expiresAt: true,
      status: true,
    },
  });
  if (!proposal) throw new Error("Not found");
  if (proposal.status === "SIGNED" || proposal.status === "CONVERTED") {
    throw new Error("Proposal sudah final");
  }
  if (proposal.status === "REJECTED") {
    throw new Error("Proposal sudah ditolak");
  }
  if (proposal.expiresAt && proposal.expiresAt < new Date()) {
    throw new Error("Proposal sudah kadaluarsa");
  }

  // Lookup phone: from proposal or user account with clientEmail
  let phone = proposal.clientPhone;
  if (!phone) {
    const clientUser = await prisma.user.findUnique({
      where: { email: proposal.clientEmail },
      select: { phone: true },
    });
    phone = clientUser?.phone ?? null;
  }

  if (!phone) {
    throw new Error(
      "Nomor WhatsApp klien belum diisi pada proposal ini. Silakan perbarui nomor WhatsApp terlebih dahulu."
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const viewUrl = `${appUrl}/proposal/${proposal.token}`;

  const tpl = waTemplates.proposalSent({
    clientName: proposal.clientName,
    proposalTitle: proposal.title,
    proposalNumber: proposal.number,
    totalAmount: formatCurrency(Number(proposal.totalAmount)),
    expiresAt: proposal.expiresAt ? formatDate(proposal.expiresAt) : undefined,
    viewUrl,
  });

  const res = await sendWhatsApp({
    to: phone,
    message: `*${tpl.title}*\n\n${tpl.message}`,
  });

  if (!res.success) {
    console.error("Send proposal WhatsApp error:", res.error);
    throw new Error(`Gagal mengirim WhatsApp: ${res.error ?? "Unknown error"}`);
  }

  await prisma.proposal.update({
    where: { id },
    data: {
      status: proposal.status === "DRAFT" ? "SENT" : proposal.status,
      sentAt: new Date(),
    },
  });
  await logAudit(user.id, "PROPOSAL_SENT", "Proposal", id);
  revalidatePath(ADMIN_ROUTES.proposals);
  revalidatePath(ADMIN_ROUTES.proposalDetail(id));
  revalidatePath(PROPOSAL_ROUTES.publicDetail(proposal.token));
}

/**
 * Called from the public proposal view when the recipient opens it.
 */
export async function markProposalViewedAction(token: string) {
  const proposal = await prisma.proposal.findUnique({
    where: { token },
    select: { id: true, status: true },
  });
  if (!proposal) return;
  if (proposal.status === "SENT") {
    await prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: "VIEWED", viewedAt: new Date() },
    });
    revalidatePath(ADMIN_ROUTES.proposalDetail(proposal.id));
    revalidatePath(PROPOSAL_ROUTES.publicDetail(token));
  }
}

/**
 * Public action, signs the proposal using the token. No auth required.
 */
export async function signProposalAction(
  token: string,
  input: { signatureDataUrl: string; signatureName: string }
): Promise<{ ok: boolean; message: string }> {
  const parsed = signatureSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Signature tidak valid.",
    };
  }

  const proposal = await prisma.proposal.findUnique({
    where: { token },
    select: {
      id: true,
      status: true,
      expiresAt: true,
    },
  });
  if (!proposal) return { ok: false, message: "Proposal tidak ditemukan." };
  if (proposal.status === "SIGNED" || proposal.status === "CONVERTED") {
    return { ok: false, message: "Proposal sudah ditandatangani." };
  }
  if (proposal.status === "REJECTED") {
    return { ok: false, message: "Proposal sudah ditolak." };
  }
  if (proposal.expiresAt && proposal.expiresAt < new Date()) {
    return { ok: false, message: "Proposal sudah kadaluarsa." };
  }

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    null;
  const ua = hdrs.get("user-agent") || null;

  await prisma.proposal.update({
    where: { id: proposal.id },
    data: {
      status: "SIGNED",
      signedAt: new Date(),
      signatureDataUrl: parsed.data.signatureDataUrl,
      signatureName: parsed.data.signatureName,
      signatureIp: ip,
      signatureUserAgent: ua,
    },
  });

  revalidatePath(ADMIN_ROUTES.proposalDetail(proposal.id));
  revalidatePath(PROPOSAL_ROUTES.publicDetail(token));
  return { ok: true, message: "Proposal berhasil ditandatangani!" };
}

export async function rejectProposalAction(
  token: string
): Promise<{ ok: boolean; message: string }> {
  const proposal = await prisma.proposal.findUnique({
    where: { token },
    select: { id: true, status: true },
  });
  if (!proposal) return { ok: false, message: "Proposal tidak ditemukan." };
  if (proposal.status === "SIGNED" || proposal.status === "CONVERTED") {
    return { ok: false, message: "Proposal sudah ditandatangani." };
  }
  await prisma.proposal.update({
    where: { id: proposal.id },
    data: { status: "REJECTED", rejectedAt: new Date() },
  });
  revalidatePath(ADMIN_ROUTES.proposalDetail(proposal.id));
  revalidatePath(PROPOSAL_ROUTES.publicDetail(token));
  return { ok: true, message: "Proposal ditolak." };
}

/**
 * Converts a signed proposal into a Project. Requires the client user
 * to already exist (manually invited by staff first, or we create one).
 */
export async function convertProposalToProjectAction(id: string) {
  const user = await requireStaff();
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!proposal) throw new Error("Not found");
  if (proposal.status !== "SIGNED") {
    throw new Error("Proposal harus ditandatangani dulu");
  }
  if (proposal.convertedProjectId) {
    throw new Error("Proposal sudah dikonversi");
  }

  // Find or create client user
  let client = await prisma.user.findUnique({
    where: { email: proposal.clientEmail },
    select: { id: true },
  });
  if (!client) {
    const tempPassword = randomBytes(6).toString("base64url") + "1A!";
    client = await prisma.user.create({
      data: {
        email: proposal.clientEmail,
        name: proposal.clientName,
        password: await bcrypt.hash(tempPassword, 10),
        roles: ["CLIENT"],
      },
      select: { id: true },
    });
  }

  const project = await prisma.project.create({
    data: {
      title: proposal.title,
      description:
        proposal.summary ||
        `Proyek dari proposal ${proposal.number} untuk ${proposal.clientName}.`,
      clientId: client.id,
      budget: proposal.totalAmount,
    },
    select: { id: true },
  });

  await prisma.proposal.update({
    where: { id },
    data: {
      status: "CONVERTED",
      convertedProjectId: project.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId: project.id,
      userId: user.id,
      action: "PROJECT_CREATED",
      description: `Proyek dibuat dari proposal ${proposal.number}.`,
    },
  });
  await logAudit(user.id, "PROPOSAL_CONVERTED", "Proposal", id, {
    projectId: project.id,
  });

  revalidatePath(ADMIN_ROUTES.proposals);
  revalidatePath(ADMIN_ROUTES.proposalDetail(id));
  revalidatePath(ADMIN_ROUTES.projects);
  revalidatePath(ADMIN_ROUTES.projectDetail(project.id));
  revalidatePath(PROPOSAL_ROUTES.publicDetail(proposal.token));
  return { ok: true, projectId: project.id };
}

export async function deleteProposalAction(id: string) {
  const user = await requireStaff();
  await prisma.proposal.delete({ where: { id } });
  await logAudit(user.id, "PROPOSAL_DELETED", "Proposal", id);
  revalidatePath(ADMIN_ROUTES.proposals);
}
