export const figmaColors = {
  /** Màu 1: #D71113 (Primary Red) */
  color1: "#D71113",
  /** Màu 2: #000000 (Primary Black Text) */
  color2: "#000000",
  /** Màu 3: #6F6F6F (Secondary Text) */
  color3: "#6F6F6F",
  /** Màu 4: #CACCCD (Border / Line / Divider) */
  color4: "#CACCCD",
  /** Màu 5: #FAFAFC (Light Element Background) */
  color5: "#FAFAFC",
  /** Màu nền 1: #FAFAFC (App Background 1) */
  bg1: "#FAFAFC",
  /** Màu nền 2: #FFFFFF (Surface / Card Background 2) */
  bg2: "#FFFFFF",
  /** Màu 0: Linear 0% #FD9956 100% -> 100% #C2A5FD 100% (Opacity 50%) */
  linear0: {
    startColor: "#FD9956",
    endColor: "#C2A5FD",
    opacity: 0.5,
    colors: ["rgba(253, 153, 86, 0.5)", "rgba(194, 165, 253, 0.5)"] as const,
    stops: [0, 1] as const,
  },
} as const;

export const colorPrimitives = {
  red: {
    100: "#F7CFD0",
    200: "#EFA0A1",
    300: "#E77071",
    400: "#DF4142",
    500: figmaColors.color1,
    700: "#A21D22",
  },
  neutral: {
    100: "#CCCCCC",
    200: "#999999",
    300: figmaColors.color3,
    400: "#333333",
    500: figmaColors.color2,
  },
  blue: {
    100: "#D2E4F2",
    200: "#A5C9E4",
    300: "#78AED7",
    400: "#4B93C9",
    500: "#1E78BC",
  },
  green: {
    100: "#D1F4E0",
    200: "#A3E2B8",
    300: "#6EE095",
    400: "#34D399",
    500: "#10B981",
    700: "#059669",
  },
  amber: {
    100: "#FFFBEB",
    500: "#F59E0B",
  },
  blueStatus: {
    100: "#EFF6FF",
    500: "#3B82F6",
  },
  redStatus: {
    100: "#FEF2F2",
    500: "#EF4444",
  },
  white: figmaColors.bg2,
  appBackground: figmaColors.bg1,
  lineIcon: "#33363F",
  mutedBorder: figmaColors.color4,
} as const;

export const calendarColors = {
  cardBackground: "#F0F6FE",
  cyan: {
    accent: "#0891B2",
    title: "#0891B2",
    icon: "#0891B2",
  },
  royalBlue: {
    accent: "#2563EB",
    title: "#1D4ED8",
    icon: "#2563EB",
  },
  teal: {
    accent: "#0D9488",
    title: "#0F766E",
    icon: "#0D9488",
  },
  skyBlue: {
    accent: "#0284C7",
    title: "#0369A1",
    icon: "#0284C7",
  },
  muted: {
    accent: "#94A3B8",
    title: "#64748B",
    icon: "#94A3B8",
  },
} as const;

export const Gradients = {
  /** Màu 0: Linear 0% #FD9956 100% -> 100% #C2A5FD 100% (Opacity 50%) */
  gradient0: figmaColors.linear0,
} as const;

export const Colors = {
  light: {
    text: figmaColors.color2,
    background: figmaColors.bg1,
    surface: figmaColors.bg2,
    backgroundElement: figmaColors.color5,
    backgroundSelected: "#E0E1E6",
    textSecondary: figmaColors.color3,
    primary: figmaColors.color1,
    primaryPressed: colorPrimitives.red[700],
    primarySoft: colorPrimitives.red[100],
    header: colorPrimitives.red[700],
    icon: colorPrimitives.lineIcon,
    divider: figmaColors.color4,
    accent: colorPrimitives.blue[500],
    success: colorPrimitives.green[500],
    successSoft: "#ECFDF5",
    warning: colorPrimitives.amber[500],
    warningSoft: colorPrimitives.amber[100],
    info: colorPrimitives.blueStatus[500],
    infoSoft: colorPrimitives.blueStatus[100],
    error: colorPrimitives.redStatus[500],
    errorSoft: colorPrimitives.redStatus[100],
    green: colorPrimitives.green[500],
  },
  dark: {
    text: colorPrimitives.white,
    background: colorPrimitives.neutral[500],
    surface: "#212225",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
    primary: colorPrimitives.red[400],
    primaryPressed: colorPrimitives.red[300],
    primarySoft: "#3A1718",
    header: colorPrimitives.red[700],
    icon: colorPrimitives.white,
    divider: colorPrimitives.neutral[400],
    accent: colorPrimitives.blue[300],
    success: colorPrimitives.green[400],
    successSoft: "#12372A",
    warning: colorPrimitives.amber[500],
    warningSoft: "#3B2D0E",
    info: colorPrimitives.blueStatus[500],
    infoSoft: "#172A46",
    error: colorPrimitives.redStatus[500],
    errorSoft: "#3B1719",
    green: colorPrimitives.green[400],
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Chuyển đổi mã màu Hex (e.g. #D71113) sang chuỗi RGBA với opacity mong muốn
 */
export function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
