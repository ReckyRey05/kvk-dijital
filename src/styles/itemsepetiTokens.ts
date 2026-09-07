/**
 * İtemSepeti — Design System Tokens
 * Central source of truth for color palettes, spacing, typography,
 * border radiuses, transition durations, and elevation styles.
 */

export const itemsepetiTokens = {
  defaultTheme: "light",
  colors: {
    // Dark Theme (Optional toggle)
    dark: {
      background: "#12141A",
      surface: "#1B1E27",
      surfaceElevated: "#232834",
      surfaceHover: "#2C3140",
      border: "#282C3A",
      borderSubtle: "#1F232E",
      text: "#EDEEF2",
      textMuted: "#9498A6",
      textSubtle: "#676B79",
      accent: "#E8A33D",
      accentHover: "#D6932E",
      accentMuted: "rgba(232, 163, 61, 0.12)",
      success: "#34D399",
      successMuted: "rgba(52, 211, 153, 0.12)",
      warning: "#FBBF24",
      warningMuted: "rgba(251, 191, 36, 0.12)",
      danger: "#F87171",
      dangerMuted: "rgba(248, 113, 113, 0.12)",
    },
    // Light Theme (Warm, tactile, player-market primary)
    light: {
      background: "#F7F7F5",
      surface: "#FFFFFF",
      surfaceElevated: "#FFFFFF",
      surfaceHover: "#F0F1F3",
      border: "#DCDDE1",
      borderSubtle: "#E6E7EA",
      text: "#17191F",
      textMuted: "#626772",
      textSubtle: "#8C919D",
      accent: "#D99532",
      accentHover: "#C48325",
      accentMuted: "rgba(217, 149, 50, 0.12)",
      success: "#059669",
      successMuted: "rgba(5, 150, 105, 0.10)",
      warning: "#D97706",
      warningMuted: "rgba(217, 119, 6, 0.10)",
      danger: "#DC2626",
      dangerMuted: "rgba(220, 38, 38, 0.10)",
    },
  },
  // Purposeful, differentiated border radiuses
  radius: {
    badge: "6px",
    control: "8px",     // small controls, inputs, dropdown items
    button: "10px",    // buttons
    card: "14px",      // listing cards, surfaces
    container: "18px", // large container shells, modal windows
  },
  typography: {
    fontSans: "var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    maxWidthProse: "80ch",
  },
  transition: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

export type ItemSepetiThemeMode = "dark" | "light";

export const itemsepetiColorSchemes = {
  light: {
    bg: "#F7F7F5",
    surface: "#FFFFFF",
    surfaceHover: "#F0F1F3",
    border: "#DCDDE1",
    text: "#17191F",
    textMuted: "#626772",
    accent: "#D99532",
  },
  dark: {
    bg: "#12141A",
    surface: "#161921",
    surfaceHover: "#1F232E",
    border: "#282C3A",
    text: "#EDEEF2",
    textMuted: "#9498A6",
    accent: "#D99532",
  },
} as const;
