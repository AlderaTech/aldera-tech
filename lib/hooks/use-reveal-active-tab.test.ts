import { expect, it, mock } from "bun:test";
let cleanup: (() => void) | undefined;
mock.module("react", () => ({
  useEffect: (effect: () => void | (() => void)) => {
    cleanup = effect() || undefined;
  },
}));
const { useRevealActiveTab } = await import("./use-reveal-active-tab");
it("scrolls the inner tab track to reveal the full active tab and disconnects observers", () => {
  const originalResize = globalThis.ResizeObserver,
    originalMutation = globalThis.MutationObserver;
  const disconnect = mock();
  class Observer {
    observe = mock();
    disconnect = disconnect;
  }
  globalThis.ResizeObserver = Observer as unknown as typeof ResizeObserver;
  globalThis.MutationObserver = Observer as unknown as typeof MutationObserver;
  try {
    const scrollTo = mock();
    const list = {
      querySelector: () => ({
        getBoundingClientRect: () => ({ left: 650, right: 750, width: 100 }),
      }),
      getBoundingClientRect: () => ({ left: 0, right: 300, width: 300 }),
      clientWidth: 300,
      scrollWidth: 1000,
      scrollLeft: 0,
      scrollTo,
    };
    const root = { matches: () => false, querySelector: () => list };
    useRevealActiveTab({ current: root as unknown as HTMLDivElement }, "last");
    expect(scrollTo).toHaveBeenCalledWith({ left: 458 });
    cleanup?.();
    expect(disconnect).toHaveBeenCalledTimes(2);
    useRevealActiveTab({ current: null }, "none");
  } finally {
    globalThis.ResizeObserver = originalResize;
    globalThis.MutationObserver = originalMutation;
  }
});
