import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type {
  AdminFeature,
  AdminProjectType,
} from "../_types/calculator-admin";

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
  usePathname: () => "/admin/calculator",
  useSearchParams: () => currentSearchParams,
}));

mock.module("@/lib/actions/calculator", () => ({
  upsertFeatureOption: mock(),
  deleteFeatureOption: mock(),
}));

const { FeaturesTab } = await import("./features-tab");

const mockProjectTypes: AdminProjectType[] = [
  {
    id: "pt-1",
    name: "Web Application",
    description: "Web app type",
    basePrice: 15000000,
    estimatedDays: 30,
    icon: null,
    order: 1,
    active: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "pt-2",
    name: "Mobile App",
    description: "Mobile app type",
    basePrice: 20000000,
    estimatedDays: 45,
    icon: null,
    order: 2,
    active: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
];

const mockFeatures: AdminFeature[] = [
  {
    id: "f-1",
    name: "Global Feature Alpha",
    description: "Feature for all projects",
    price: 3000000,
    isMajor: true,
    disclaimer: null,
    projectTypeId: null,
    order: 1,
    active: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    projectType: null,
  },
  {
    id: "f-2",
    name: "Web Specific Feature Beta",
    description: "Only for web app",
    price: 5000000,
    isMajor: false,
    disclaimer: null,
    projectTypeId: "pt-1",
    order: 2,
    active: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    projectType: { name: "Web Application" },
  },
  {
    id: "f-3",
    name: "Mobile Specific Feature Gamma",
    description: "Only for mobile app",
    price: 7000000,
    isMajor: false,
    disclaimer: null,
    projectTypeId: "pt-2",
    order: 3,
    active: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    projectType: { name: "Mobile App" },
  },
];

describe("FeaturesTab UI Component", () => {
  it("renders all features when no ?projectType= filter is applied (default ALL)", () => {
    setSearchParams();
    const html = renderToStaticMarkup(
      <FeaturesTab items={mockFeatures} projectTypes={mockProjectTypes} />
    );

    expect(html).toContain("Global Feature Alpha");
    expect(html).toContain("Web Specific Feature Beta");
    expect(html).toContain("Mobile Specific Feature Gamma");
  });

  it("filters to only global features when ?projectType=GLOBAL", () => {
    setSearchParams("projectType=GLOBAL");
    const html = renderToStaticMarkup(
      <FeaturesTab items={mockFeatures} projectTypes={mockProjectTypes} />
    );

    expect(html).toContain("Global Feature Alpha");
    expect(html).not.toContain("Web Specific Feature Beta");
    expect(html).not.toContain("Mobile Specific Feature Gamma");
  });

  it("filters to specific project type features when ?projectType=pt-1", () => {
    setSearchParams("projectType=pt-1");
    const html = renderToStaticMarkup(
      <FeaturesTab items={mockFeatures} projectTypes={mockProjectTypes} />
    );

    expect(html).not.toContain("Global Feature Alpha");
    expect(html).toContain("Web Specific Feature Beta");
    expect(html).not.toContain("Mobile Specific Feature Gamma");
  });

  it("displays empty state when filter has no matching items", () => {
    setSearchParams("projectType=pt-nonexistent");
    const html = renderToStaticMarkup(
      <FeaturesTab items={mockFeatures} projectTypes={mockProjectTypes} />
    );

    expect(html).toContain("Belum ada fitur untuk kategori ini");
  });
});
