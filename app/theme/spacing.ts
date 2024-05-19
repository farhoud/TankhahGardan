import { ViewStyle } from "react-native"

/**
  Use these spacings for margins/paddings and other whitespace throughout your app.
 */
export const spacing = {
  xxxs: 2,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const

export const $row: ViewStyle = {
  flexDirection:"row",
  justifyContent: "space-around",
  alignItems:"center",
  alignContent:"center"
}

export const $debugBorder: ViewStyle = {
  borderColor: "red",
  borderWidth: 2
}

export type Spacing = keyof typeof spacing
