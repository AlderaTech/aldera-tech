const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const waTemplates = {
  projectStatusChanged(projectTitle: string, newStatus: string) {
    return {
      title: "Update Proyek",
      message: `Proyek "${projectTitle}" status berubah menjadi: ${newStatus}.\n\nLihat detail: ${APP_URL}/dashboard/projects`,
    };
  },

  milestoneReadyForApproval(projectTitle: string, milestoneTitle: string, projectId: string) {
    return {
      title: "Milestone Siap Direview",
      message: `Milestone "${milestoneTitle}" pada proyek "${projectTitle}" sudah selesai dan menunggu persetujuan Anda.\n\nReview: ${APP_URL}/dashboard/projects/${projectId}`,
    };
  },

  invoiceSent(invoiceNumber: string, total: string, dueDate: string) {
    return {
      title: "Invoice Baru",
      message: `Invoice ${invoiceNumber} sebesar ${total} telah diterbitkan.\nJatuh tempo: ${dueDate}\n\nLihat: ${APP_URL}/dashboard/invoices`,
    };
  },

  invoiceReminder(invoiceNumber: string, total: string, dueDate: string) {
    return {
      title: "Pengingat Invoice",
      message: `Invoice ${invoiceNumber} sebesar ${total} akan/sudah jatuh tempo (${dueDate}).\n\nLihat: ${APP_URL}/dashboard/invoices`,
    };
  },

  newMessage(senderName: string, projectTitle: string, projectId: string) {
    return {
      title: "Pesan Baru",
      message: `${senderName} mengirim pesan di proyek "${projectTitle}".\n\nBalas: ${APP_URL}/dashboard/projects/${projectId}`,
    };
  },

  fileUploaded(uploaderName: string, fileName: string, projectTitle: string, projectId: string) {
    return {
      title: "File Baru Diupload",
      message: `${uploaderName} mengupload file "${fileName}" di proyek "${projectTitle}".\n\nLihat: ${APP_URL}/dashboard/projects/${projectId}`,
    };
  },

  taskCompleted(taskTitle: string, projectTitle: string) {
    return {
      title: "Task Selesai",
      message: `Task "${taskTitle}" pada proyek "${projectTitle}" telah diselesaikan.`,
    };
  },
} as const;
