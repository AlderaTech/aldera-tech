import { beforeEach, describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("server-only", () => ({}));

const mockReplace = mock();
const mockPush = mock();
let currentSearchParams = new URLSearchParams("");

mock.module("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
    refresh: mock(),
  }),
  usePathname: () => "/dashboard/projects/proj-123",
  useSearchParams: () => currentSearchParams,
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const mockProject = {
  id: "proj-123",
  title: "Aplikasi Mobile E-Commerce",
  description: "Pengembangan aplikasi Flutter & backend Go",
  status: "IN_PROGRESS",
  deadline: new Date("2026-12-31"),
  budget: 50000000,
  progress: 65,
  clientId: "user-client-1",
  milestones: [
    { id: "m-1", title: "Milestone 1: UI/UX", status: "COMPLETED", order: 1 },
    {
      id: "m-2",
      title: "Milestone 2: API & Integrasi",
      status: "IN_PROGRESS",
      order: 2,
    },
  ],
  tasks: [
    {
      id: "t-1",
      title: "Desain wireframe",
      status: "COMPLETED",
      order: 1,
      assignee: { id: "dev-1", name: "Dev One" },
      milestone: { id: "m-1", title: "Milestone 1: UI/UX" },
    },
  ],
  activities: [],
  testimonial: null,
  files: [],
  invoices: [],
  messages: [],
};

const findUniqueMock = mock(async () => mockProject);

mock.module("@/lib/prisma", () => ({
  prisma: {
    project: {
      findUnique: findUniqueMock,
    },
  },
}));

mock.module("@/auth", () => ({
  auth: mock(async () => ({
    user: { id: "user-client-1", role: "CLIENT", name: "Client Test" },
  })),
}));

const { default: UserProjectDetailPage } = await import("./page");
const { ProjectTabs, VALID_PROJECT_TABS, isValidProjectTab } =
  await import("./_components/project-tabs");

describe("Dashboard Project Detail - Tab Deep-Linking & URL Param State", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockPush.mockClear();
    findUniqueMock.mockClear();
    currentSearchParams = new URLSearchParams("");
  });

  describe("Tab Validation and Constants", () => {
    it("exports all 6 standard project tabs", () => {
      expect(VALID_PROJECT_TABS).toEqual([
        "timeline",
        "tasks",
        "activity",
        "messages",
        "files",
        "invoices",
      ]);
    });

    it("accurately validates valid project tab keys", () => {
      expect(isValidProjectTab("timeline")).toBe(true);
      expect(isValidProjectTab("tasks")).toBe(true);
      expect(isValidProjectTab("activity")).toBe(true);
      expect(isValidProjectTab("messages")).toBe(true);
      expect(isValidProjectTab("files")).toBe(true);
      expect(isValidProjectTab("invoices")).toBe(true);
    });

    it("rejects unknown or invalid tab strings", () => {
      expect(isValidProjectTab("unknown")).toBe(false);
      expect(isValidProjectTab("")).toBe(false);
      expect(isValidProjectTab(null)).toBe(false);
      expect(isValidProjectTab(undefined)).toBe(false);
    });
  });

  describe("Server Page Component & searchParams Resolution", () => {
    it("renders page with default timeline tab when searchParams is undefined", async () => {
      const pageJsx = await UserProjectDetailPage({
        params: Promise.resolve({ id: "proj-123" }),
      });
      expect(pageJsx).toBeDefined();

      const html = renderToStaticMarkup(pageJsx);
      expect(html).toContain("Aplikasi Mobile E-Commerce");
      expect(html).toContain("Timeline");
      expect(html).toContain("Tasks (1)");
      expect(html).toContain("Invoices (0)");
    });

    it("renders page and forwards resolved tab parameter when searchParams is provided", async () => {
      const pageJsx = await UserProjectDetailPage({
        params: Promise.resolve({ id: "proj-123" }),
        searchParams: Promise.resolve({ tab: "tasks" }),
      });
      expect(pageJsx).toBeDefined();

      const html = renderToStaticMarkup(pageJsx);
      expect(html).toContain("Aplikasi Mobile E-Commerce");
      expect(html).toContain("Tasks (1)");
    });
  });

  describe("ProjectTabs Client Component", () => {
    it("renders tabs correctly with initialTab", () => {
      const html = renderToStaticMarkup(
        <ProjectTabs initialTab="activity">
          <div data-testid="tab-content">Tab Body Content</div>
        </ProjectTabs>
      );
      expect(html).toContain("Tab Body Content");
    });

    it("falls back to timeline tab if invalid tab is provided", () => {
      const html = renderToStaticMarkup(
        <ProjectTabs initialTab="nonexistent-tab">
          <div data-testid="tab-content">Timeline Content</div>
        </ProjectTabs>
      );
      expect(html).toContain("Timeline Content");
    });
  });
});
