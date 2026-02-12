// Design tokens from DESIGN_DOCUMENT.md
export const tokens = {
  primary: "#2D5BFF",
  success: "#27AE60",
  warning: "#F2994A",
  error: "#EB5757",

  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",
} as const;

export default {
  light: {
    text: tokens.gray900,
    background: tokens.gray50,
    tint: tokens.primary,
    tabIconDefault: tokens.gray400,
    tabIconSelected: tokens.primary,
  },
  dark: {
    text: "#fff",
    background: "#000",
    tint: "#fff",
    tabIconDefault: tokens.gray400,
    tabIconSelected: "#fff",
  },
};
