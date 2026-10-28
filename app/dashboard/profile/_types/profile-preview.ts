export type PreviewResource<T> =
  | { status: "ready"; items: readonly T[] }
  | { status: "loading" }
  | { status: "error"; message: string };

export type PreviewProject = {
  id: string;
  name: string;
  description: string;
  kind: "web" | "mobile" | "dashboard";
  status: "IN_PROGRESS" | "REVIEW" | "COMPLETED";
  progress: number;
  startDate: string;
  targetDate: string;
  deliverables: readonly string[];
};

export type PreviewPaymentMethod = {
  id: string;
  name: string;
  kind: "bank" | "card";
  maskedNumber: string;
  description: string;
};

export type PreviewActivity = {
  id: string;
  kind: "progress" | "document" | "status";
  description: string;
  occurredAt: string;
};
