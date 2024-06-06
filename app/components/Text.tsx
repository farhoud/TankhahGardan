import i18n from "i18n-js"
import React from "react"
import { StyleProp, TextStyle} from "react-native"
import { Text as RNPText, TextProps as RNPTextProps } from "react-native-paper"
import { isRTL, translate, TxKeyPath } from "../i18n"
import { colors, typography } from "../theme"
import { VariantProp } from "react-native-paper/lib/typescript/components/Typography/types"


export interface TextProps extends Omit<RNPTextProps<VariantProp<never>>,"children"> {
  /**
   * Text which is looked up via i18n.
   */
  tx?: TxKeyPath
  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: string
  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: i18n.TranslateOptions
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<TextStyle>
  /**
   * Children components.
   */
  children?: React.ReactNode
}

/**
 * For your text displaying needs.
 * This component is a HOC over the built-in React Native one.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/Text/}
 * @param {TextProps} props - The props for the `Text` component.
 * @returns {JSX.Element} The rendered `Text` component.
 */
export function Text(props: TextProps) {
    const { tx, txOptions, text, children, style: $styleOverride, ...rest } = props

  const i18nText = tx && translate(tx, txOptions)
  const content = i18nText || text || children

  const $styles: StyleProp<TextStyle> = [
    {fontFamily: "IRANSansXFaNum-Regular"},
    $styleOverride,
  ]

  return (
    <RNPText {...rest} style={$styles}>
      {content}
    </RNPText>
  )
}

