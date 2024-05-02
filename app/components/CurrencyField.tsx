import React, { forwardRef, Ref, useImperativeHandle, useMemo, useRef } from "react"
import { TextInput as RNTextInput } from "react-native"
import { TextField, TextFieldProps } from "./TextField"
import { TextInput } from "react-native-paper"
import MaskInput, { createNumberMask } from "react-native-mask-input"
import { tomanFormatter } from "app/utils/formatDate"

export interface CurrencyFieldProps extends Omit<TextFieldProps, "ref" | "value"> {
  value: number
  onChangeValue: (value: number) => void
}

/**
 * A component that allows for the entering and editing of text.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/CurrencyField/}
 * @param {CurrencyFieldProps} props - The props for the `CurrencyField` component.
 * @returns {JSX.Element} The rendered `CurrencyField` component.
 */
export const CurrencyField = forwardRef(function CurrencyField(
  props: CurrencyFieldProps,
  ref: Ref<RNTextInput>,
) {
  const { value, onChangeValue, ...TextInputProps } = props
  const input = useRef<RNTextInput>(null)

  useImperativeHandle(ref, () => input.current as RNTextInput)

  const currencyMask = createNumberMask({
    delimiter: "٫",
    separator: ".",
    precision: 0,
  })

  const helper = useMemo(() => {
    return props.error ? props.helper : tomanFormatter(Number(value))
  }, [value, props.error])

  return (
    <TextField
      ref={input}
      value={value? value.toString():""}
      right={<TextInput.Affix text="﷼" />}
      keyboardType="numeric"
      helper={helper}
      render={(props) => (
        <MaskInput
          {...props}
          mask={currencyMask}
          onChangeText={(masked, unmasked) => {
            onChangeValue(Number(unmasked) || 0)
          }}
        />
      )}
      {...TextInputProps}
    />
  )
})
