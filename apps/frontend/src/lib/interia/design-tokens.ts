export const tokens = {
  warmCanvas: "#F7F3EC",
  softCream: "#FBF8F2",
  porcelain: "#FFFFFF",
  sandBorder: "#E7DED1",
  sandBorderStrong: "#DAD0C0",
  charcoal: "#1F1F1C",
  warmGray: "#6F6A61",
  dustGray: "#9A9489",
  sage: "#5F7F63",
  deepSage: "#49634D",
  mistSage: "#E7EFE4",
  terracotta: "#C97855",
  clay: "#E9C7B3",
  mutedGold: "#C9A96A",
} as const;

export type DesignToken = keyof typeof tokens;
