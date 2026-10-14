import type {
  ProjectStatus,
  MilestoneStatus,
  InvoiceStatus,
  ProposalStatus,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";

export const projectStatusMeta: Record<
  ProjectStatus,
  {
    label: string;
    variant:
      | "default"
      | "secondary"
      | "destructive"
      | "success"
      | "warning"
      | "outline";
  }
> = {
  PENDING: { label: "Pending", variant: "secondary" },
  IN_PROGRESS: { label: "Berjalan", variant: "default" },
  REVIEW: { label: "Review", variant: "warning" },
  COMPLETED: { label: "Selesai", variant: "success" },
  CANCELLED: { label: "Dibatalkan", variant: "destructive" },
};

export const milestoneStatusMeta: Record<
  MilestoneStatus,
  {
    label: string;
    variant:
      | "default"
      | "secondary"
      | "destructive"
      | "success"
      | "warning"
      | "outline";
  }
> = {
  PENDING: { label: "Pending", variant: "secondary" },
  IN_PROGRESS: { label: "Berjalan", variant: "default" },
  COMPLETED: { label: "Selesai", variant: "success" },
  BLOCKED: { label: "Terhambat", variant: "destructive" },
};

export const invoiceStatusMeta: Record<
  InvoiceStatus,
  {
    label: string;
    variant:
      | "default"
      | "secondary"
      | "destructive"
      | "success"
      | "warning"
      | "outline";
  }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  SENT: { label: "Terkirim", variant: "default" },
  PENDING_VERIFICATION: { label: "Menunggu Verifikasi", variant: "warning" },
  PAID: { label: "Lunas", variant: "success" },
  OVERDUE: { label: "Lewat Jatuh Tempo", variant: "destructive" },
  CANCELLED: { label: "Dibatalkan", variant: "outline" },
};

export const proposalStatusMeta: Record<
  ProposalStatus,
  {
    label: string;
    variant:
      | "default"
      | "secondary"
      | "destructive"
      | "success"
      | "warning"
      | "outline";
  }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  SENT: { label: "Terkirim", variant: "default" },
  VIEWED: { label: "Dilihat", variant: "warning" },
  SIGNED: { label: "Ditandatangani", variant: "success" },
  REJECTED: { label: "Ditolak", variant: "destructive" },
  CONVERTED: { label: "Jadi Proyek", variant: "success" },
  EXPIRED: { label: "Kadaluarsa", variant: "outline" },
};

export const taskStatusMeta: Record<
  TaskStatus,
  {
    label: string;
    variant:
      | "default"
      | "secondary"
      | "destructive"
      | "success"
      | "warning"
      | "outline";
  }
> = {
  BACKLOG: { label: "Backlog", variant: "secondary" },
  TODO: { label: "Todo", variant: "outline" },
  IN_PROGRESS: { label: "Berjalan", variant: "default" },
  REVIEW: { label: "Review", variant: "warning" },
  DONE: { label: "Selesai", variant: "success" },
};

export const taskPriorityMeta: Record<
  TaskPriority,
  {
    label: string;
    variant:
      | "default"
      | "secondary"
      | "destructive"
      | "success"
      | "warning"
      | "outline";
  }
> = {
  LOW: { label: "Low", variant: "outline" },
  MEDIUM: { label: "Medium", variant: "secondary" },
  HIGH: { label: "High", variant: "warning" },
  URGENT: { label: "Urgent", variant: "destructive" },
};
