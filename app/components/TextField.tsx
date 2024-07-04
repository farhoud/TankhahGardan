import React, { forwardRef, Ref, useImperativeHandle, useRef } from "react"
import { TextStyle, View, ViewStyle, StyleProp, TextInput as RNTextInput, NativeSyntheticEvent, TextInputFocusEventData } from "react-native"
import { translate } from "../i18n"
import { spacing } from "../theme"
import { TextProps } from "./Text"
import { HelperText, TextInput, TextInputProps } from "react-native-paper"

export interface TextFieldProps extends Omit<TextInputProps, "ref"> {
  /**
   * The label text to display if not using `labelTx`.
   */
  label?: TextProps["text"]
  /**
   * Label text which is looked up via i18n.
   */
  labelTx?: TextProps["tx"]
  /**
   * Optional label options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  labelTxOptions?: TextProps["txOptions"]
  /**
   * Pass any additional props directly to the label Text component.
   */
  LabelTextProps?: TextProps
  /**
   * The helper text to display if not using `helperTx`.
   */
  helper?: TextProps["text"]
  /**
   * Helper text which is looked up via i18n.
   */
  helperTx?: TextProps["tx"]
  /**
   * Optional helper options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  helperTxOptions?: TextProps["txOptions"]
  /**
   * Pass any additional props directly to the helper Text component.
   */
  HelperTextProps?: TextProps
  /**
   * The placeholder text to display if not using `placeholderTx`.
   */
  placeholder?: TextProps["text"]
  /**
   * Placeholder text which is looked up via i18n.
   */
  placeholderTx?: TextProps["tx"]
  /**
   * Optional placeholder options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  placeholderTxOptions?: TextProps["txOptions"]

  textStyle?: StyleProp<TextStyle>

  containerStyle?: StyleProp<ViewStyle>
}

/**
 * A component that allows for the entering and editing of text.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/TextField/}
 * @param {TextFieldProps} props - The props for the `TextField` component.
 * @returns {JSX.Element} The rendered `TextField` component.
 */
export const TextField = forwardRef(function TextField(
  props: TextFieldProps,
  ref: Ref<RNTextInput>,
) {
  const {
    labelTx,
    label,
    labelTxOptions,
    placeholderTx,
    placeholder,
    placeholderTxOptions,
    helper,
    helperTx,
    helperTxOptions,
    HelperTextProps,
    LabelTextProps,
    containerStyle,
    style,
    mode,
    ...TextInputProps
  } = props
  const input = useRef<RNTextInput>(null)

  const placeholderContent = placeholderTx
    ? translate(placeholderTx, placeholderTxOptions)
    : placeholder
  const labelContent = labelTx ? translate(labelTx, labelTxOptions) : label
  const helperContent = helperTx ? translate(helperTx, helperTxOptions) : helper

  const $containerStyle = [$container, containerStyle]
  const $style = [style]

  useImperativeHandle(ref, () => input.current as RNTextInput)

  return (
    <View style={$containerStyle}>
      <TextInput
        ref={input}
        placeholder={placeholderContent}
        label={labelContent}
        style={$style}
        mode={mode || "outlined"}
        {...TextInputProps}
      />
      {!!(helper || helperTx) && (
        <HelperText type={props.error ? "error" : "info"} visible={!!(helper || helperTx)}>
          {helperContent}
        </HelperText>
      )}
    </View>
  )
})

const $container: ViewStyle = {
  marginBottom: spacing.xs,
}
