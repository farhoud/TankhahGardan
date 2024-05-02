import React, { forwardRef, Ref, useImperativeHandle, useRef } from "react"
import {
  TextStyle,
  View,
  ViewStyle,
  TextInput as RNTextInput,
} from "react-native"
import { translate } from "../i18n"
import { colors, spacing, typography } from "../theme"
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
  
  textStyle?: TextStyle
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
    mode,
    ...TextInputProps
  } = props
  const input = useRef<RNTextInput>(null)

  const placeholderContent = placeholderTx
    ? translate(placeholderTx, placeholderTxOptions)
    : placeholder
  const labelContent = labelTx ? translate(labelTx, labelTxOptions) : label
  const helperContent = helperTx ? translate(helperTx, helperTxOptions) : helper

  useImperativeHandle(ref, () => input.current as RNTextInput)

  return (
    <View style={{}}>
      <TextInput
        ref={input}
        {...TextInputProps}
        placeholder={placeholderContent}
        label={labelContent}
        mode={mode||'outlined'}
      />
      {!!(helper || helperTx) && (
        <HelperText type={props.error?"error":"info"} visible={!!(helper || helperTx)}>
          {helperContent}
        </HelperText>
      )}
    </View>
  )
})

const $labelStyle: TextStyle = {
  marginBottom: spacing.xs,
}

const $inputWrapperStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  borderWidth: 1,
  borderRadius: 4,
  backgroundColor: colors.palette.neutral200,
  borderColor: colors.palette.neutral400,
  overflow: "hidden",
}

const $inputStyle: TextStyle = {
  flex: 1,
  alignSelf: "stretch",
  fontFamily: typography.primary.normal,
  color: colors.text,
  fontSize: 16,
  height: 24,
  // https://github.com/facebook/react-native/issues/21720#issuecomment-532642093
  paddingVertical: 0,
  paddingHorizontal: 0,
  marginVertical: spacing.xs,
  marginHorizontal: spacing.sm,
}

const $helperStyle: TextStyle = {
  marginTop: spacing.xs,
}

const $rightAccessoryStyle: ViewStyle = {
  marginEnd: spacing.xs,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
}
const $leftAccessoryStyle: ViewStyle = {
  marginStart: spacing.xs,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
}
