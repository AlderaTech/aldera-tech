import "server-only";
import nodemailer from "nodemailer";

let cachedTransport: nodemailer.Transporter | null = null;

function getTransport() {
  if (cachedTransport) return cachedTransport;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    // Return a "jsonTransport" for local dev so sends don't throw.
    cachedTransport = nodemailer.createTransport({ jsonTransport: true });
    return cachedTransport;
  }

  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return cachedTransport;
}

export type SendMailArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>;
};

export async function sendMail({ to, subject, html, text, attachments }: SendMailArgs) {
  const from = process.env.SMTP_FROM ?? "Solvo Tech <no-reply@solvo.tech>";
  const transport = getTransport();
  const info = await transport.sendMail({
    from,
    to,
    subject,
    html,
    text,
    attachments,
  });
  return info;
}

export function invoiceEmailHtml(args: {
  number: string;
  clientName: string;
  total: string;
  dueDate: string;
  viewUrl: string;
  isReminder?: boolean;
}) {
  const { number, clientName, total, dueDate, viewUrl, isReminder } = args;
  const title = isReminder ? "Pengingat Invoice" : `Invoice ${number}`;
  const intro = isReminder
    ? `Ini adalah pengingat bahwa invoice <strong>${number}</strong> akan jatuh tempo / sudah lewat jatuh tempo.`
    : `Berikut invoice <strong>${number}</strong> untuk proyek Anda dengan Solvo Tech.`;
  return `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;background:#f6f6f6;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;">
  <div style="background:#0ea5e9;color:white;padding:20px;">
    <h1 style="margin:0;font-size:20px;">${title}</h1>
  </div>
  <div style="padding:24px;">
    <p>Halo <strong>${clientName}</strong>,</p>
    <p>${intro}</p>
    <table style="width:100%;margin:16px 0;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#666;">Nomor</td><td align="right"><strong>${number}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#666;">Total</td><td align="right"><strong>${total}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#666;">Jatuh tempo</td><td align="right">${dueDate}</td></tr>
    </table>
    <p style="text-align:center;margin:24px 0;">
      <a href="${viewUrl}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Lihat Invoice</a>
    </p>
    <p style="color:#666;font-size:13px;">Terima kasih atas kepercayaan Anda.<br/>Tim Solvo Tech</p>
  </div>
</div>
</body></html>`;
}
