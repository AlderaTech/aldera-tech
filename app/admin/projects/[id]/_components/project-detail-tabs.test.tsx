import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { Session } from "next-auth";
import type { AdminProjectDetail } from "../_data/project-detail";

mock.module("server-only", () => ({}));

let currentSearchParams = new URLSearchParams();
function setSearchParams(query: string = "") {
  currentSearchParams = new URLSearchParams(query);
  (
    globalThis as unknown as { __mockSearchParams?: URLSearchParams }
  ).__mockSearchParams = currentSearchParams;
}

const redirect = mock((path: string): never => {
  throw new Error(`redirect:${path}`);
});
const notFound = mock((): never => {
  throw new Error("notFound");
});

mock.module("next/navigation", () => ({
  redirect,
  notFound,
  useRouter: () => ({ replace: mock(), push: mock(), refresh: mock() }),
  usePathname: () => "/admin/projects/proj-123",
  useSearchParams: () => currentSearchParams,
}));

const { ProjectDetailTabs } = await import("./project-detail-tabs");

const mockProject: AdminProjectDetail = {
  id: "proj-123",
  title: "Test Project",
  description: "Test project description",
  status: "IN_PROGRESS",
  progress: 50,
  autoProgress: false,
  deadline: new Date("2026-12-31"),
  budget:
    50000000 as unknown as import("@prisma/client/runtime/library").Decimal,
  clientId: "client-1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
  client: { id: "client-1", name: "Client Name", email: "client@test.com" },
  milestones: [
    {
      id: "m-1",
      projectId: "proj-123",
      title: "Milestone 1",
      description: "First milestone",
      status: "IN_PROGRESS",
      order: 1,
      dueDate: new Date("2026-03-01"),
      completedAt: null,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
    },
  ],
  tasks: [],
  activities: [],
  files: [],
  invoices: [],
  messages: [],
  timeEntries: [],
  assignments: [],
};

const mockSession: Session = {
  user: {
    id: "user-admin",
    name: "Admin User",
    email: "admin@test.com",
    role: "ADMIN",
  },
  expires: "2099-01-01",
};

describe("ProjectDetailTabs UI Component", () => {
  it("renders all 8 project tabs triggers correctly", () => {
    setSearchParams();
    const html = renderToStaticMarkup(
      <ProjectDetailTabs project={mockProject} session={mockSession} />
    );

    expect(html).toContain("Overview");
    expect(html).toContain("Milestones");
    expect(html).toContain("Tasks");
    expect(html).toContain("Activity");
    expect(html).toContain("Diskusi");
    expect(html).toContain("Time");
    expect(html).toContain("Files");
    expect(html).toContain("Invoices");
  });

  it("activates overview tab by default when no ?tab= query param is present", () => {
    setSearchParams();
    const html = renderToStaticMarkup(
      <ProjectDetailTabs project={mockProject} session={mockSession} />
    );

    expect(html).toContain('data-state="active"');
    expect(html).toContain("Informasi proyek");
  });

  it("activates milestones tab when ?tab=milestones is in the URL", () => {
    setSearchParams("tab=milestones");
    const html = renderToStaticMarkup(
      <ProjectDetailTabs project={mockProject} session={mockSession} />
    );

    expect(html).toContain('data-state="active"');
    expect(html).toContain("Milestone 1");
  });

  it("falls back to overview tab when an invalid ?tab= is provided", () => {
    setSearchParams("tab=nonexistent");
    const html = renderToStaticMarkup(
      <ProjectDetailTabs project={mockProject} session={mockSession} />
    );

    expect(html).toContain('data-state="active"');
  });
});
