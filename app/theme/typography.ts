// TODO: write documentation about fonts and typography along with guides on how to add custom fonts in own
// markdown file and add links from here

import { Platform } from "react-native"
import {
  SpaceGrotesk_300Light as spaceGroteskLight,
  SpaceGrotesk_400Regular as spaceGroteskRegular,
  SpaceGrotesk_500Medium as spaceGroteskMedium,
  SpaceGrotesk_600SemiBold as spaceGroteskSemiBold,
  SpaceGrotesk_700Bold as spaceGroteskBold,
} from "@expo-google-fonts/space-grotesk"

export const customFontsToLoad = {
  spaceGroteskLight,
  spaceGroteskRegular,
  spaceGroteskMedium,
  spaceGroteskSemiBold,
  spaceGroteskBold,
  "IRANSansXFaNum-Regular": require("../../assets/fonts/IRANSansXFaNum-Regular.ttf"),
  "IRANSansXFaNum-Bold": require("../../assets/fonts/IRANSansXFaNum-Bold.ttf"),
}

const fonts = {
  spaceGrotesk: {
    // Cross-platform Google font.
    light: "spaceGroteskLight",
    normal: "spaceGroteskRegular",
    medium: "spaceGroteskMedium",
    semiBold: "spaceGroteskSemiBold",
    bold: "spaceGroteskBold",
  },
  helveticaNeue: {
    // iOS only font.
    thin: "HelveticaNeue-Thin",
    light: "HelveticaNeue-Light",
    normal: "Helvetica Neue",
    medium: "HelveticaNeue-Medium",
  },
  courier: {
    // iOS only font.
    normal: "Courier",
  },
  sansSerif: {
    // Android only font.
    thin: "sans-serif-thin",
    light: "sans-serif-light",
    normal: "sans-serif",
    medium: "sans-serif-medium",
  },
  monospace: {
    // Android only font.
    normal: "monospace",
  },
  iranSans: {
    normal: "IRANSansXFaNum-Regular",
    bold: "IRANSansXFaNum-Bold",
    thin: "IRANSansXFaNum-Regular",
    light: "IRANSansXFaNum-Regular",
    medium: "IRANSansXFaNum-Regular",
  },
}

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used in most places.
   */
  primary: fonts.iranSans,
  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: Platform.select({ ios: fonts.iranSans, android: fonts.iranSans }),
  /**
   * Lets get fancy with a monospace font!
   */
  code: Platform.select({ ios: fonts.iranSans, android: fonts.iranSans }),
}

export const fontConfig = {
  fontFamily: "IRANSansXFaNum-Regular",
  displaySmall: {
    fontFamily: "IRANSansXFaNum-Regular",
    fontSize: 36,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 44,
  },
  displayMedium: {
    fontFamily: "IRANSansXFaNum-Regular",
    fontSize: 45,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 52,
  },
  displayLarge: {
    fontFamily: "IRANSansXFaNum-Regular",
    fontSize: 57,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 64,
  },
  headlineSmall: {
    fontFamily: "IRANSansXFaNum-Regular",
    fontSize: 22,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 32,
  },
  headlineMedium: {
    fontFamily: "IRANSansXFaNum-Regular",
    fontSize: 26,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineLarge: {
    fontFamily: "IRANSansXFaNum-Regular",
    fontSize: 30,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 40,
  },
  titleSmall: {
    fontFamily: "IRANSansXFaNum-Regular",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1,
    lineHeight: 20,
  },

  titleMedium: {
    fontFamily: "IRANSansXFaNum-Regular",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.15,
    lineHeight: 24,
  },

  titleLarge: {
    fontFamily: "IRANSansXFaNum-Regular",
    fontSize: 22,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 28,
  },

  labelSmall: {
    fontFamily: "IRANSansXFaNum-Regular",
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelMedium: {
    fontFamily: "IRANSansXFaNum-Regular",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelLarge: {
    fontFamily: "IRANSansXFaNum-Regular",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: "IRANSansXFaNum-Regular",
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  bodyMedium: {
    fontFamily: "IRANSansXFaNum-Regular",
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodyLarge: {
    fontFamily: "IRANSansXFaNum-Regular",
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.15,
    lineHeight: 24,
  },
}
