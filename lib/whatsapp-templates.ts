import { DASHBOARD_ROUTES } from "@/lib/routes";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const waTemplates = {
  projectStatusChanged(projectTitle: string, newStatus: string) {
    return {
      title: "Update Proyek",
      message: `Proyek "${projectTitle}" status berubah menjadi: ${newStatus}.\n\nLihat detail: ${APP_URL}${DASHBOARD_ROUTES.projects}`,
    };
  },

  milestoneReadyForApproval(
    projectTitle: string,
    milestoneTitle: string,
    projectId: string
  ) {
    return {
      title: "Milestone Siap Direview",
      message: `Milestone "${milestoneTitle}" pada proyek "${projectTitle}" sudah selesai dan menunggu persetujuan Anda.\n\nReview: ${APP_URL}${DASHBOARD_ROUTES.projectDetail(projectId)}`,
    };
  },

  invoiceSent(invoiceNumber: string, total: string, dueDate: string) {
    return {
      title: "Invoice Baru",
      message: `Invoice ${invoiceNumber} sebesar ${total} telah diterbitkan.\nJatuh tempo: ${dueDate}\n\nLihat: ${APP_URL}${DASHBOARD_ROUTES.invoices}`,
    };
  },

  invoiceReminder(invoiceNumber: string, total: string, dueDate: string) {
    return {
      title: "Pengingat Invoice",
      message: `Invoice ${invoiceNumber} sebesar ${total} akan/sudah jatuh tempo (${dueDate}).\n\nLihat: ${APP_URL}${DASHBOARD_ROUTES.invoices}`,
    };
  },

  newMessage(senderName: string, projectTitle: string, projectId: string) {
    return {
      title: "Pesan Baru",
      message: `${senderName} mengirim pesan di proyek "${projectTitle}".\n\nBalas: ${APP_URL}${DASHBOARD_ROUTES.projectDetail(projectId)}`,
    };
  },

  fileUploaded(
    uploaderName: string,
    fileName: string,
    projectTitle: string,
    projectId: string
  ) {
    return {
      title: "File Baru Diupload",
      message: `${uploaderName} mengupload file "${fileName}" di proyek "${projectTitle}".\n\nLihat: ${APP_URL}${DASHBOARD_ROUTES.projectDetail(projectId)}`,
    };
  },

  taskCompleted(taskTitle: string, projectTitle: string) {
    return {
      title: "Task Selesai",
      message: `Task "${taskTitle}" pada proyek "${projectTitle}" telah diselesaikan.`,
    };
  },

  passwordReset(args: { name: string; resetUrl: string; ttlHours?: number }) {
    const hours = args.ttlHours ?? 2;
    return {
      title: "Reset Password Aldera Tech",
      message: `Halo *${args.name}*,\n\nKami menerima permintaan untuk mereset password akun Aldera Tech Anda. Klik tautan di bawah dalam ${hours} jam ke depan untuk melanjutkan:\n\n${args.resetUrl}\n\nJika Anda tidak meminta reset, abaikan pesan ini.`,
    };
  },

  proposalSent(args: {
    clientName: string;
    proposalTitle: string;
    proposalNumber: string;
    totalAmount: string;
    viewUrl: string;
    expiresAt?: string;
  }) {
    const expiryLine = args.expiresAt
      ? `\nBerlaku hingga: ${args.expiresAt}`
      : "";
    return {
      title: "Penawaran Proposal Baru",
      message: `Halo *${args.clientName}*,\n\nKami telah menyiapkan proposal *${args.proposalTitle}* (${args.proposalNumber}) dengan total nilai *${args.totalAmount}*.${expiryLine}\n\nSilakan review dan tandatangani melalui tautan berikut:\n${args.viewUrl}\n\nTerima kasih,\nTim Aldera Tech`,
    };
  },
} as const;
