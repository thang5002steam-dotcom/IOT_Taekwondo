import { Platform, type TextStyle } from "react-native";

export const fontFamilies = {
  robotoRegular: "Roboto_400Regular",
  robotoMedium: "Roboto_500Medium",
  robotoSemiBold: "Roboto_600SemiBold",
  robotoExtraBold: "Roboto_800ExtraBold",
  systemSans: Platform.select({ ios: "System", default: "sans-serif" }),
  systemMono: Platform.select({ ios: "Menlo", default: "monospace" }),
} as const;

export const typography = {
  heading: {
    fontFamily: fontFamilies.robotoMedium,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "500",
  },
  subtitle: {
    fontFamily: fontFamilies.robotoExtraBold,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "800",
  },
  title: {
    fontFamily: fontFamilies.robotoSemiBold,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: "600",
  },
  body: {
    fontFamily: fontFamilies.robotoRegular,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "400",
  },
  bodySmall: {
    fontFamily: fontFamilies.robotoRegular,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400",
  },
  caption: {
    fontFamily: fontFamilies.robotoExtraBold,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "800",
  },
  featureLabel: {
    fontFamily: fontFamilies.robotoSemiBold,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
  action: {
    fontFamily: fontFamilies.robotoMedium,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  statusBar: {
    fontFamily: Platform.select({
      ios: "SF Pro Text",
      default: fontFamilies.robotoSemiBold,
    }),
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
    letterSpacing: -0.32,
  },
  code: {
    fontFamily: fontFamilies.systemMono,
    fontSize: 12,
    fontWeight: Platform.select({ android: "700", default: "500" }),
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
