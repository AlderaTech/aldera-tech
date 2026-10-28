type TabScrollMetrics = {
  scrollLeft: number;
  viewportWidth: number;
  scrollWidth: number;
  tabLeft: number;
  tabWidth: number;
};

export function getRelayTabScrollLeft({
  scrollLeft,
  viewportWidth,
  scrollWidth,
  tabLeft,
  tabWidth,
}: TabScrollMetrics): number {
  const padding = 8;
  const maxScroll = Math.max(0, scrollWidth - viewportWidth);
  const clamp = (value: number) => Math.max(0, Math.min(maxScroll, value));

  if (tabLeft < scrollLeft + padding) return clamp(tabLeft - padding);
  if (tabLeft + tabWidth > scrollLeft + viewportWidth - padding) {
    return clamp(tabLeft + tabWidth - viewportWidth + padding);
  }
  return clamp(scrollLeft);
}
