import React, { ReactNode, memo, useCallback, useEffect, useRef, useState } from "react"
import { TextInput, TextStyle, View, ViewStyle } from "react-native"
import { Text } from "../Text"
import {
  getYear,
  getDate,
  getMonth,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  setDate,
  setMonth,
  setYear,
} from "date-fns-jalali"
import { formatDateIR } from "app/utils/formatDate"
import { Button, Portal, Dialog } from "react-native-paper"
import { TextFieldProps, TextField } from "../TextField"
import { createAnimatedPropAdapter } from "react-native-reanimated"
import { Wheel } from "./Wheel"

export interface DatePickerProps extends TextFieldProps {
  date?: Date
  onDateChange?: (date: Date) => void
  onDone?: (date: Date) => void
  action?: (props: { open: () => void; close: () => void; value: Date }) => ReactNode
  minDate?: Date
  maxDate?: Date
  modalMode?: "datetime" | "date" | "time"
}

/**
 * A component that allows for the entering and editing of text.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/TextField/}
 * @param {TextFieldProps} props - The props for the `TextField` component.
 * @returns {JSX.Element} The rendered `TextField` component.
 */
export const DatePicker = (props: DatePickerProps) => {
  const {
    date,
    onDateChange,
    action,
    minDate,
    maxDate,
    modalMode = "date",
    ...TextInputProps
  } = props
  const ref = useRef<TextInput>(null)

  const [_date, _setDate] = useState(date || new Date())
  const [err, setErr] = useState(false)

  const [modalVisibility, setModalVisibility] = useState(false)

  const handleDateChange = (value: Date) => {
    if ((!!maxDate && value > maxDate) || (!!minDate && value < minDate)) {
      setErr(true)
    } else {
      setErr(false)
    }
    _setDate(value)
  }

  const handleClose = () => {
    setModalVisibility(false)
    onDateChange && onDateChange(_date)
    props.onDone && props.onDone(_date)
  }

  const renderAction = useCallback(() => {
    if (!action) return undefined
    return action({
      open: () => setModalVisibility(true),
      close: handleClose,
      value: _date || new Date(),
    })
  }, [action, _date])

  useEffect(() => {
    _setDate(date || new Date())
  }, [date])

  return (
    <>
      {action ? (
        renderAction()
      ) : (
        <TextField
          ref={ref}
          style={$leftAlien}
          value={formatDateIR(_date)}
          {...TextInputProps}
          onFocus={() => {
            setModalVisibility(true)
          }}
          showSoftInputOnFocus={false}
        />
      )}

      <Portal>
        <Dialog visible={modalVisibility} onDismiss={handleClose}>
          <Dialog.Title>انتخاب تاریخ</Dialog.Title>

          <Dialog.Content
            style={{ borderColor: err ? "red" : undefined, borderWidth: err ? 1 : 0 }}
          >
            <DatePickerModal
              showDate={modalMode !== "time"}
              showTime={modalMode !== "date"}
              maxDate={maxDate}
              minDate={minDate}
              value={_date}
              onValueChange={handleDateChange}
            ></DatePickerModal>
          </Dialog.Content>
          <Dialog.Actions>
            <Button disabled={err} onPress={handleClose}>
              ثبت
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  )
}
const $leftAlien: ViewStyle | TextStyle = { direction: "ltr", textAlign: "left" }

interface DatePickerModalProps {
  value: Date
  onValueChange: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  showTime?: boolean
  showDate?: boolean
}

/**
 * Model for selecting date
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/Card/}
 * @param {DatePickerModalProps} props - The props for the `DatePicker` component.
 * @returns {JSX.Element} The rendered `DatePicker` component.
 */
export const DatePickerModal = memo(function DatePickerModal(props: DatePickerModalProps) {
  const { value, onValueChange, showDate = true, showTime = false } = props

  return (
    <>
      {showDate && (
        <View style={$dpkContentContainer}>
          <Wheel
            // minValue={limitConstraint.minYear}
            // maxValue={limitConstraint.maxYear}
            range={[1398, 1405]}
            value={getYear(value)}
            onScroll={(i) => {
              onValueChange(setYear(value, i))
            }}
          ></Wheel>

          <Text style={{ alignSelf: "center" }} variant="labelLarge">
            ٫
          </Text>
          <Wheel
            // minValue={limitConstraint.minMonth}
            // maxValue={limitConstraint.maxMonth}
            range={[1, 12]}
            value={getMonth(value) + 1}
            onScroll={(i) => {
              onValueChange(setMonth(value, i - 1))
            }}
          ></Wheel>
          <Text style={{ alignSelf: "center" }} variant="labelLarge">
            ٫
          </Text>
          <Wheel
            range={[1, 31]}
            // minValue={limitConstraint.minDay}
            // maxValue={limitConstraint.maxDay}
            value={getDate(value)}
            onScroll={(i) => {
              onValueChange(setDate(value, i))
            }}
          ></Wheel>
        </View>
      )}
      {showTime && (
        <View style={$dpkContentContainer}>
          <Wheel
            // minValue={limitConstraint.minHour}
            // maxValue={limitConstraint.maxHour}
            range={[0, 24]}
            value={getHours(value)}
            onScroll={(i) => {
              onValueChange(setHours(value, i))
            }}
          ></Wheel>

          <Text style={{ alignSelf: "center" }} variant="labelLarge">
            :
          </Text>
          <Wheel
            // minValue={limitConstraint.minMinute}
            // maxValue={limitConstraint.maxMinute}
            range={[0, 60]}
            value={getMinutes(value)}
            onScroll={(i) => {
              onValueChange(setMinutes(value, i))
            }}
          ></Wheel>
        </View>
      )}
    </>
  )
})

const $dpkContentContainer: ViewStyle = {
  display: "flex",
  flexDirection: "row-reverse",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 10,
}

export const TextInputAdapter = createAnimatedPropAdapter(
  (props) => {
    "worklet"
    const keys = Object.keys(props)
    // convert text to value like RN does here: https://github.com/facebook/react-native/blob/f2c6279ca497b34d5a2bfbb6f2d33dc7a7bea02a/Libraries/Components/TextInput/TextInput.js#L878
    if (keys.includes("value")) {
      props.text = props.value as any
      delete props.value
    }
  },
  ["text"],
)
