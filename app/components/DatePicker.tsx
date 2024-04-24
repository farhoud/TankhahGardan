import React, {
  ComponentType,
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import {
  Keyboard,
  Modal,
  ModalProps,
  StyleProp,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { isRTL, translate } from "../i18n"
import { colors, spacing, typography } from "../theme"
import { Text, TextProps } from "./Text"
import { format, newDate, getYear, getDate, getMonth } from "date-fns-jalali"
import { Icon } from "./Icon"
import { Button } from "./Button"

export interface TextFieldAccessoryProps {
  style: StyleProp<any>
  status: TextFieldProps["status"]
  multiline: boolean
  editable: boolean
}

export interface TextFieldProps extends Omit<TextInputProps, "ref"> {
  date?: Date
  onDateChange?: (date: Date) => void
  /**
   * A style modifier for different input states.
   */
  status?: "error" | "disabled"
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
  /**
   * Optional input style override.
   */
  style?: StyleProp<TextStyle>
  /**
   * Style overrides for the container
   */
  containerStyle?: StyleProp<ViewStyle>
  /**
   * Style overrides for the input wrapper
   */
  inputWrapperStyle?: StyleProp<ViewStyle>
  /**
   * An optional component to render on the right side of the input.
   * Example: `RightAccessory={(props) => <Icon icon="ladybug" containerStyle={props.style} color={props.editable ? colors.textDim : colors.text} />}`
   * Note: It is a good idea to memoize this.
   */
  RightAccessory?: ComponentType<TextFieldAccessoryProps>
  /**
   * An optional component to render on the left side of the input.
   * Example: `LeftAccessory={(props) => <Icon icon="ladybug" containerStyle={props.style} color={props.editable ? colors.textDim : colors.text} />}`
   * Note: It is a good idea to memoize this.
   */
  LeftAccessory?: ComponentType<TextFieldAccessoryProps>
}

/**
 * A component that allows for the entering and editing of text.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/TextField/}
 * @param {TextFieldProps} props - The props for the `TextField` component.
 * @returns {JSX.Element} The rendered `TextField` component.
 */
export const DatePicker = forwardRef(function TextField(
  props: TextFieldProps,
  ref: Ref<TextInput>,
) {
  const {
    date,
    onDateChange,
    labelTx,
    label,
    labelTxOptions,
    placeholderTx,
    placeholder,
    placeholderTxOptions,
    helper,
    helperTx,
    helperTxOptions,
    status,
    RightAccessory,
    LeftAccessory,
    HelperTextProps,
    LabelTextProps,
    style: $inputStyleOverride,
    containerStyle: $containerStyleOverride,
    inputWrapperStyle: $inputWrapperStyleOverride,
    ...TextInputProps
  } = props
  const input = useRef<TextInput>(null)

  const disabled = TextInputProps.editable === false || status === "disabled"

  const [_date, _setDate] = useState(date||new Date())

  const [modalVisibility, setModalVisibility] = useState(false)

  const placeholderContent = placeholderTx
    ? translate(placeholderTx, placeholderTxOptions)
    : placeholder

  const $containerStyles = [$containerStyleOverride]

  const $labelStyles = [$labelStyle, LabelTextProps?.style]

  const $inputWrapperStyles = [
    $inputWrapperStyle,
    status === "error" && { borderColor: colors.error },
    TextInputProps.multiline && { minHeight: 112 },
    LeftAccessory && { paddingStart: 0 },
    RightAccessory && { paddingEnd: 0 },
    $inputWrapperStyleOverride,
  ]

  const $inputStyles: StyleProp<TextStyle> = [
    $inputStyle,
    disabled && { color: colors.textDim },
    isRTL && { textAlign: "left" as TextStyle["textAlign"] },
    TextInputProps.multiline && { height: "auto" },
    $inputStyleOverride,
  ]

  const $helperStyles = [
    $helperStyle,
    status === "error" && { color: colors.error },
    HelperTextProps?.style,
  ]

  /**
   *
   */
  function focusInput() {
    if (disabled) return

    input.current?.focus()
  }

  useImperativeHandle(ref, () => input.current as TextInput)

  const handleDateChange = (value:Date)=>{
    _setDate(value)
    onDateChange && onDateChange(value)
  }

  useEffect(()=>{
    _setDate(date||new Date())
  },[date])

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={$containerStyles}
      onPress={focusInput}
      accessibilityState={{ disabled }}
    >
      {!!(label || labelTx) && (
        <Text
          preset="formLabel"
          text={label}
          tx={labelTx}
          txOptions={labelTxOptions}
          {...LabelTextProps}
          style={$labelStyles}
        />
      )}

      <View style={$inputWrapperStyles}>
        {!!LeftAccessory && (
          <LeftAccessory
            style={$leftAccessoryStyle}
            status={status}
            editable={!disabled}
            multiline={TextInputProps.multiline ?? false}
          />
        )}

        <TextInput
          ref={input}
          value={format(_date, "yyyy/MM/dd")}
          underlineColorAndroid={colors.transparent}
          textAlignVertical="top"
          placeholder={placeholderContent}
          placeholderTextColor={colors.textDim}
          {...TextInputProps}
          editable={!disabled}
          style={$inputStyles}
          onFocus={() => {
            setModalVisibility(true)
            Keyboard.dismiss()
          }}
        />

        <DatePickerModal
          onRequestClose={() => {
            setModalVisibility(!modalVisibility)
          }}
          onClose={() => {
            setModalVisibility(!modalVisibility)
            Keyboard.dismiss()
          }}
          value={_date}
          onValueChange={handleDateChange}
          visible={modalVisibility}
        ></DatePickerModal>

        {!!RightAccessory && (
          <RightAccessory
            style={$rightAccessoryStyle}
            status={status}
            editable={!disabled}
            multiline={TextInputProps.multiline ?? false}
          />
        )}
      </View>

      {!!(helper || helperTx) && (
        <Text
          preset="formHelper"
          text={helper}
          tx={helperTx}
          txOptions={helperTxOptions}
          {...HelperTextProps}
          style={$helperStyles}
        />
      )}
    </TouchableOpacity>
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

interface DatePickerModalProps extends ModalProps {
  value: Date
  onValueChange: (date: Date) => void
  onClose: (date: Date) => void
}

/**
 * Model for selecting date
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/Card/}
 * @param {DatePickerModalProps} props - The props for the `DatePicker` component.
 * @returns {JSX.Element} The rendered `DatePicker` component.
 */
export function DatePickerModal(props: DatePickerModalProps) {
  const { value, onValueChange, ...modalProps } = props
  const [year, setYear] = useState(getYear(value).toString())
  const [month, setMonth] = useState((getMonth(value) + 1).toString().padStart(2, "0"))
  const [day, setDay] = useState(getDate(value).toString().padStart(2, "0"))

  function changeValue(
    str: string,
    increase: boolean,
    func: React.Dispatch<React.SetStateAction<string>>,
    pad: number,
  ) {
    const num = Number(str)
    if (increase) {
      func((num + 1).toString().padStart(pad, "0"))
    } else {
      func((num - 1).toString().padStart(pad, "0"))
    }
  }

  function handelDateUpdate(year: string, month: string, day: string) {
    const date = newDate(Number(year), Number(month) - 1, Number(day))
    onValueChange(date)
  }

  useEffect(() => {
    handelDateUpdate(year, month, day)
  }, [year, month, day])

  useEffect(()=>{
    setYear(getYear(value).toString())
    setMonth((getMonth(value) + 1).toString().padStart(2, "0"))
    setDay(getDate(value).toString().padStart(2, "0"))
  },[value])

  return (
    <View style={$centeredView}>
      <Modal transparent {...(modalProps as ModalProps)}>
        <View style={$centeredView}>
          <View style={$dpkContainer}>
            <View style={$dpkContentContainer}>
              <View style={$dpkController}>
                <TouchableOpacity
                  style={$dpkIconBtn}
                  onPress={() => changeValue(year, true, setYear, 4)}
                >
                  <Icon icon={"caretUp"}></Icon>
                </TouchableOpacity>
                <TextInput
                  style={$dpkInput}
                  onChangeText={(data) => setYear(data)}
                  value={year}
                  keyboardType="numeric"
                  maxLength={4}
                ></TextInput>
                <TouchableOpacity
                  style={$dpkIconBtn}
                  onPress={() => changeValue(year, false, setYear, 4)}
                >
                  <Icon icon={"caretDown"}></Icon>
                </TouchableOpacity>
              </View>
              <View style={$dpkController}>
                <TouchableOpacity
                  style={$dpkIconBtn}
                  onPress={() => changeValue(month, true, setMonth, 2)}
                >
                  <Icon icon={"caretUp"}></Icon>
                </TouchableOpacity>
                <TextInput
                  style={$dpkInput}
                  onChangeText={(data) => setMonth(data)}
                  value={month}
                  keyboardType="numeric"
                  maxLength={2}
                ></TextInput>
                <TouchableOpacity
                  style={$dpkIconBtn}
                  onPress={() => changeValue(month, false, setMonth, 2)}
                >
                  <Icon icon={"caretDown"}></Icon>
                </TouchableOpacity>
              </View>
              <View style={$dpkController}>
                <TouchableOpacity
                  style={$dpkIconBtn}
                  onPress={() => changeValue(day, true, setDay, 2)}
                >
                  <Icon icon={"caretUp"}></Icon>
                </TouchableOpacity>
                <TextInput
                  style={$dpkInput}
                  value={day}
                  onChangeText={(data) => setDay(data)}
                  keyboardType="numeric"
                  maxLength={2}
                ></TextInput>
                <TouchableOpacity
                  style={$dpkIconBtn}
                  onPress={() => changeValue(day, false, setDay, 2)}
                >
                  <Icon icon={"caretDown"}></Icon>
                </TouchableOpacity>
              </View>
            </View>
            <View style={$dpkContentActions}>
              <Button
                tx="common.ok"
                onPress={() => {
                  props.onClose(value)
                }}
              ></Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
const $centeredView: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  // marginTop: 22,
}

const $dpkContainer: ViewStyle = {
  margin: 20,
  backgroundColor: "white",
  borderRadius: 20,
  padding: 35,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
}

const $dpkContentContainer: ViewStyle = {
  display: "flex",
  flexDirection: "row",
}

const $dpkContentActions: ViewStyle = {}

const $dpkController: ViewStyle = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  alignItems: "center",
  // justifyContent: "space-between",
}

const $dpkInput = {
  fontSize: 16,
}

const $dpkIconBtn: ViewStyle = { padding: 10, borderRadius: 180 }
