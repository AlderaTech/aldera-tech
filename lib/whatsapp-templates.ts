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

  invoicePaid(invoiceNumber: string, total: string) {
    return {
      title: "Pembayaran Diterima (Lunas)",
      message: `Pembayaran invoice ${invoiceNumber} sebesar ${total} telah berhasil diverifikasi dan berstatus LUNAS. Terima kasih atas kerja sama Anda.\n\nLihat invoice: ${APP_URL}${DASHBOARD_ROUTES.invoices}`,
    };
  },

  paymentProofReceived(invoiceNumber: string, total: string) {
    return {
      title: "Bukti Pembayaran Diterima",
      message: `Bukti transfer untuk invoice ${invoiceNumber} sebesar ${total} telah kami terima dan sedang dalam antrean verifikasi tim finance Aldera Tech.\n\nLihat status: ${APP_URL}${DASHBOARD_ROUTES.invoices}`,
    };
  },

  paymentProofRejected(invoiceNumber: string, reason: string) {
    return {
      title: "Bukti Pembayaran Ditolak",
      message: `Mohon maaf, bukti transfer untuk invoice ${invoiceNumber} belum dapat diverifikasi dengan catatan: ${reason}. Silakan unggah kembali bukti pembayaran yang valid.\n\nUnggah ulang: ${APP_URL}${DASHBOARD_ROUTES.invoices}`,
    };
  },

  verificationOtp(args: { code: string; ttlMinutes?: number }) {
    const mins = args.ttlMinutes ?? 10;
    return {
      title: "Kode Verifikasi Aldera Tech",
      message: `Kode verifikasi WhatsApp Anda adalah *${args.code}*.\n\nKode ini berlaku selama ${mins} menit. JANGAN bagikan kode ini kepada siapa pun demi keamanan akun dan transaksi Anda.`,
    };
  },

  proposalSignatureOtp(args: {
    clientName: string;
    proposalNumber: string;
    code: string;
    ttlMinutes?: number;
  }) {
    const mins = args.ttlMinutes ?? 10;
    return {
      title: "Verifikasi Tanda Tangan Proposal",
      message: `Halo *${args.clientName}*,\n\nKode OTP untuk menyetujui dan menandatangani proposal *${args.proposalNumber}* adalah: *${args.code}*.\n\nKode ini berlaku selama ${mins} menit. Masukkan kode ini pada halaman penandatanganan untuk menyelesaikan proses.`,
    };
  },

  proposalSignedConfirmation(args: {
    clientName: string;
    proposalTitle: string;
    proposalNumber: string;
    signedAt: string;
  }) {
    return {
      title: "Proposal Berhasil Ditandatangani",
      message: `Halo *${args.clientName}*,\n\nTerima kasih! Proposal *${args.proposalTitle}* (${args.proposalNumber}) telah berhasil ditandatangani secara digital pada *${args.signedAt}*.\n\nTim Aldera Tech akan segera menghubungi Anda untuk tahap onboarding dan peluncuran proyek.\n\nSalam hangat,\nTim Aldera Tech`,
    };
  },
} as const;
