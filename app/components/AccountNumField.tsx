import React, {
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react"
import { TextInput as RNTextInput, TextStyle, ViewStyle } from "react-native"
import { TextField, TextFieldProps } from "./TextField"
import MaskInput, { Mask } from "react-native-mask-input"
import { PaymentMethod, paymentMethodAccountTypeMapper } from "app/models/realm/models"
import { translate, TxKeyPath } from "app/i18n"

export interface AccountNumFieldProps extends Omit<TextFieldProps, "ref"> {
  paymentMethod?: PaymentMethod
}
const SHEBA_MASK = [
  /[I]/,
  /[R]/,
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
]
const CARD_MASK = [
  /[0-9*]/,
  /[0-9*]/,
  /[0-9*]/,
  /[0-9*]/,
  "-",
  /[0-9*]/,
  /[0-9*]/,
  /[0-9*]/,
  /[0-9*]/,
  "-",
  /[0-9*]/,
  /[0-9*]/,
  /[0-9*]/,
  /[0-9*]/,
  "-",
  /[0-9*]/,
  /[0-9*]/,
  /[0-9*]/,
  /[0-9*]/,
]
/**
 * A component that allows for the entering and editing of text.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/AccountNumField/}
 * @param {AccountNumFieldProps} props - The props for the `AccountNumField` component.
 * @returns {JSX.Element} The rendered `AccountNumField` component.
 */
export const AccountNumField = forwardRef(function AccountNumField(
  props: AccountNumFieldProps,
  ref: Ref<RNTextInput>,
) {
  const { paymentMethod, onChangeText, ...TextInputProps } = props
  const input = useRef<RNTextInput>(null)

  useImperativeHandle(ref, () => input.current as RNTextInput)

  const accountNumType = useMemo(() => {
    return paymentMethodAccountTypeMapper(paymentMethod)
  }, [paymentMethod])

  const accountNumMask = useMemo(() => {
    switch (accountNumType) {
      case "sheba":
        return SHEBA_MASK as Mask
      case "card":
        return CARD_MASK as Mask
      default:
        return undefined
    }
  }, [accountNumType])

  useEffect(() => {
    if (!props.value) {
      accountNumMask === SHEBA_MASK && props.onChangeText && props.onChangeText("IR")
    }
  }, [accountNumMask])

  const $display: ViewStyle = accountNumType === "none" ? { display: "none" } : {}

  return (
    <TextField
      {...TextInputProps}
      style={[$leftAlien, $display]}
      ref={input}
      // right={renderAffix()}
      keyboardType="numeric"
      labelTx={"accountNumType.label"}
      labelTxOptions={{ type: translate(("accountNumType." + accountNumType) as TxKeyPath) }}
      placeholderTx={"accountNumType.placeHolder"}
      placeholderTxOptions={{ type: translate(("accountNumType." + accountNumType) as TxKeyPath) }}
      render={(props) => (
        <MaskInput
          {...props}
          mask={accountNumMask}
          onChangeText={(masked, _) => {
            onChangeText && onChangeText(masked)
          }}
        />
      )}
    />
  )
})

const $leftAlien: ViewStyle | TextStyle = { direction: "ltr", textAlign: "left" }
