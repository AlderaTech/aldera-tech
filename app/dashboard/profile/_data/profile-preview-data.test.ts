import { describe, expect, it } from "bun:test";
import {
  PROFILE_PREVIEW_PROJECTS,
  PROFILE_PREVIEW_PAYMENTS,
  PROFILE_PREVIEW_ACTIVITIES,
  PROFILE_PREVIEW_LIMITS,
} from "./profile-preview-data";

describe("Batas data preview Profil", () => {
  it("menyediakan proyek demo yang valid dan tidak menggunakan ID akun", () => {
    for (const project of PROFILE_PREVIEW_PROJECTS) {
      expect(project.id).toStartWith("demo-");
      expect(project.progress).toBeGreaterThanOrEqual(0);
      expect(project.progress).toBeLessThanOrEqual(100);
      expect(Date.parse(project.targetDate)).toBeGreaterThanOrEqual(
        Date.parse(project.startDate)
      );
      expect(project.deliverables.length).toBeGreaterThan(0);
    }
    expect(PROFILE_PREVIEW_LIMITS.projects).toBe(3);
  });
  it("hanya menyertakan nomor tersamarkan fiktif", () => {
    for (const method of PROFILE_PREVIEW_PAYMENTS) {
      expect(method.maskedNumber).toMatch(/^•{4} \d{4}$/);
      expect(method.id).toStartWith("demo-");
      expect(Object.keys(method).sort()).toEqual([
        "description",
        "id",
        "kind",
        "maskedNumber",
        "name",
      ]);
    }
  });
  it("menggunakan waktu tetap serta membatasi daftar aktivitas", () => {
    for (const event of PROFILE_PREVIEW_ACTIVITIES) {
      expect(event.id).toStartWith("demo-");
      expect(Number.isNaN(Date.parse(event.occurredAt))).toBe(false);
    }
    expect(PROFILE_PREVIEW_LIMITS.activities).toBe(5);
  });
});
