import { describe, expect, it } from "bun:test";
import { getActiveTabScrollLeft } from "./active-tab-scroll";

const viewport = {
  scrollLeft: 240,
  viewportWidth: 400,
  scrollWidth: 1400,
  tabLeft: 280,
  tabWidth: 160,
};

describe("Posisi tab aktif AI Relay", () => {
  it("mempertahankan posisi ketika tab sudah terlihat seluruhnya", () => {
    expect(getActiveTabScrollLeft(viewport)).toBe(240);
  });
  it("mengungkap tab di kiri atau kanan tanpa melewati batas track", () => {
    expect(getActiveTabScrollLeft({ ...viewport, tabLeft: 120 })).toBe(112);
    expect(getActiveTabScrollLeft({ ...viewport, tabLeft: 680 })).toBe(448);
    expect(getActiveTabScrollLeft({ ...viewport, tabLeft: 0 })).toBe(0);
    expect(getActiveTabScrollLeft({ ...viewport, tabLeft: 1300 })).toBe(1000);
  });
  it("tidak menggulir track yang cukup lebar untuk seluruh tab", () => {
    expect(
      getActiveTabScrollLeft({
        ...viewport,
        viewportWidth: 1600,
        scrollLeft: 0,
      })
    ).toBe(0);
  });
});
