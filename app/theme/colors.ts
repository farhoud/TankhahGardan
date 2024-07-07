// TODO: write documentation for colors and palette in own markdown file and add links from here

const palette = {
  neutral100: "#FFFFFF",
  neutral200: "#F4F2F1",
  neutral300: "#D7CEC9",
  neutral400: "#B6ACA6",
  neutral500: "#978F8A",
  neutral600: "#564E4A",
  neutral700: "#3C3836",
  neutral800: "#191015",
  neutral900: "#000000",

  primary100: "#F4E0D9",
  primary200: "#E8C1B4",
  primary300: "#DDA28E",
  primary400: "#D28468",
  primary500: "#C76542",
  primary600: "#A54F31",

  secondary100: "#DCDDE9",
  secondary200: "#BCC0D6",
  secondary300: "#9196B9",
  secondary400: "#626894",
  secondary500: "#41476E",

  accent100: "#FFEED4",
  accent200: "#FFE1B2",
  accent300: "#FDD495",
  accent400: "#FBC878",
  accent500: "#FFBB50",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  overlay20: "rgba(25, 16, 21, 0.2)",
  overlay50: "rgba(25, 16, 21, 0.5)",
} as const

export const colors = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,
  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",
  /**
   * The default text color in many components.
   */
  text: palette.neutral800,
  /**
   * Secondary text information.
   */
  textDim: palette.neutral600,
  /**
   * The default color of the screen background.
   */
  background: palette.neutral200,
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color.
   */
  tint: palette.primary500,
  /**
   * A subtle color used for lines.
   */
  separator: palette.neutral300,
  /**
   * Error messages.
   */
  error: palette.angry500,
  /**
   * Error Background.
   *
   */
  errorBackground: palette.angry100,
}



export const CustomMD3Dark = {
  "colors": {
    "primary": "rgb(242, 191, 56)",
    "onPrimary": "rgb(63, 46, 0)",
    "primaryContainer": "rgb(90, 67, 0)",
    "onPrimaryContainer": "rgb(255, 223, 153)",
    "secondary": "rgb(215, 197, 160)",
    "onSecondary": "rgb(58, 47, 21)",
    "secondaryContainer": "rgb(82, 69, 42)",
    "onSecondaryContainer": "rgb(244, 224, 187)",
    "tertiary": "rgb(175, 207, 171)",
    "onTertiary": "rgb(28, 54, 29)",
    "tertiaryContainer": "rgb(50, 77, 50)",
    "onTertiaryContainer": "rgb(203, 235, 198)",
    "error": "rgb(255, 180, 171)",
    "onError": "rgb(105, 0, 5)",
    "errorContainer": "rgb(147, 0, 10)",
    "onErrorContainer": "rgb(255, 180, 171)",
    "background": "rgb(30, 27, 22)",
    "onBackground": "rgb(233, 225, 217)",
    "surface": "rgb(30, 27, 22)",
    "onSurface": "rgb(233, 225, 217)",
    "surfaceVariant": "rgb(77, 70, 57)",
    "onSurfaceVariant": "rgb(208, 197, 180)",
    "outline": "rgb(153, 144, 128)",
    "outlineVariant": "rgb(77, 70, 57)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(233, 225, 217)",
    "inverseOnSurface": "rgb(51, 48, 42)",
    "inversePrimary": "rgb(119, 90, 0)",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(41, 35, 24)",
      "level2": "rgb(47, 40, 25)",
      "level3": "rgb(53, 45, 26)",
      "level4": "rgb(55, 47, 26)",
      "level5": "rgb(60, 50, 27)"
    },
    "surfaceDisabled": "rgba(233, 225, 217, 0.12)",
    "onSurfaceDisabled": "rgba(233, 225, 217, 0.38)",
    "backdrop": "rgba(54, 48, 36, 0.4)"
  }
}

export const CustomMD3Light = {
  "colors": {
    "primary": "rgb(119, 90, 0)",
    "onPrimary": "rgb(255, 255, 255)",
    "primaryContainer": "rgb(255, 223, 153)",
    "onPrimaryContainer": "rgb(37, 26, 0)",
    "secondary": "rgb(106, 93, 63)",
    "onSecondary": "rgb(255, 255, 255)",
    "secondaryContainer": "rgb(244, 224, 187)",
    "onSecondaryContainer": "rgb(36, 26, 4)",
    "tertiary": "rgb(73, 101, 72)",
    "onTertiary": "rgb(255, 255, 255)",
    "tertiaryContainer": "rgb(203, 235, 198)",
    "onTertiaryContainer": "rgb(6, 33, 9)",
    "error": "rgb(186, 26, 26)",
    "onError": "rgb(255, 255, 255)",
    "errorContainer": "rgb(255, 218, 214)",
    "onErrorContainer": "rgb(65, 0, 2)",
    "background": "rgb(255, 251, 255)",
    "onBackground": "rgb(30, 27, 22)",
    "surface": "rgb(255, 251, 255)",
    "onSurface": "rgb(30, 27, 22)",
    "surfaceVariant": "rgb(236, 225, 207)",
    "onSurfaceVariant": "rgb(77, 70, 57)",
    "outline": "rgb(126, 118, 103)",
    "outlineVariant": "rgb(208, 197, 180)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(51, 48, 42)",
    "inverseOnSurface": "rgb(247, 240, 231)",
    "inversePrimary": "rgb(242, 191, 56)",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(248, 243, 242)",
      "level2": "rgb(244, 238, 235)",
      "level3": "rgb(240, 233, 227)",
      "level4": "rgb(239, 232, 224)",
      "level5": "rgb(236, 229, 219)"
    },
    "surfaceDisabled": "rgba(30, 27, 22, 0.12)",
    "onSurfaceDisabled": "rgba(30, 27, 22, 0.38)",
    "backdrop": "rgba(54, 48, 36, 0.4)"
  }
}