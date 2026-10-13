/**
 * İtemSepeti — Design System Tokens
 * Central source of truth for color palettes, spacing, typography,
 * border radiuses, transition durations, and elevation styles.
 */

export const itemsepetiTokens = {
  defaultTheme: "light",
  colors: {
    // Dark Theme (Clean, subtle slate dark)
    dark: {
      background: "#101317",
      surface: "#181C22",
      surfaceElevated: "#20252D",
      surfaceHover: "#262D36",
      border: "#2A313C",
      borderSubtle: "#1E242C",
      text: "#EDEEF2",
      textMuted: "#8E97A4",
      textSubtle: "#626A76",
      accent: "#168B83",
      accentHover: "#11736C",
      accentMuted: "rgba(22, 139, 131, 0.14)",
      success: "#10B981",
      successMuted: "rgba(16, 185, 129, 0.12)",
      warning: "#F59E0B",
      warningMuted: "rgba(245, 158, 11, 0.12)",
      danger: "#EF4444",
      dangerMuted: "rgba(239, 68, 68, 0.12)",
    },
    // Light Theme (Clean, reliable, professional marketplace primary)
    light: {
      background: "#F7F8FA",
      surface: "#FFFFFF",
      surfaceElevated: "#FFFFFF",
      surfaceHover: "#F0F4F3",
      border: "#E5E8EB",
      borderSubtle: "#EEF0F2",
      text: "#15191E",
      textMuted: "#69717D",
      textSubtle: "#8D96A3",
      accent: "#0F625C",
      accentHover: "#0C4F4A",
      accentMuted: "rgba(15, 98, 92, 0.10)",
      success: "#0D8259",
      successMuted: "rgba(13, 130, 89, 0.10)",
      warning: "#D97706",
      warningMuted: "rgba(217, 119, 6, 0.10)",
      danger: "#DC2626",
      dangerMuted: "rgba(220, 38, 38, 0.10)",
    },
  },
  // Purposeful, disciplined 8-12px radiuses
  radius: {
    badge: "5px",
    control: "8px",     // small controls, inputs, dropdown items
    button: "8px",     // buttons
    card: "10px",      // listing cards, surfaces (8-12px as requested)
    container: "12px", // large container shells, modal windows
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
    bg: "#F7F8FA",
    surface: "#FFFFFF",
    surfaceHover: "#F0F4F3",
    border: "#E5E8EB",
    text: "#15191E",
    textMuted: "#69717D",
    accent: "#0F625C",
  },
  dark: {
    bg: "#101317",
    surface: "#181C22",
    surfaceHover: "#262D36",
    border: "#2A313C",
    text: "#EDEEF2",
    textMuted: "#8E97A4",
    accent: "#168B83",
  },
} as const;
