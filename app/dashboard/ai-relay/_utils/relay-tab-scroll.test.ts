import { describe, expect, it } from "bun:test";
import { getRelayTabScrollLeft } from "./relay-tab-scroll";

const viewport = {
  scrollLeft: 240,
  viewportWidth: 400,
  scrollWidth: 1400,
  tabLeft: 280,
  tabWidth: 160,
};

describe("Posisi tab aktif AI Relay", () => {
  it("mempertahankan posisi ketika tab sudah terlihat seluruhnya", () => {
    expect(getRelayTabScrollLeft(viewport)).toBe(240);
  });
  it("mengungkap tab di kiri atau kanan tanpa melewati batas track", () => {
    expect(getRelayTabScrollLeft({ ...viewport, tabLeft: 120 })).toBe(112);
    expect(getRelayTabScrollLeft({ ...viewport, tabLeft: 680 })).toBe(448);
    expect(getRelayTabScrollLeft({ ...viewport, tabLeft: 0 })).toBe(0);
    expect(getRelayTabScrollLeft({ ...viewport, tabLeft: 1300 })).toBe(1000);
  });
  it("tidak menggulir track yang cukup lebar untuk seluruh tab", () => {
    expect(
      getRelayTabScrollLeft({ ...viewport, viewportWidth: 1600, scrollLeft: 0 })
    ).toBe(0);
  });
});
