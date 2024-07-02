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
import { Button, Portal, Dialog, Chip } from "react-native-paper"
import { TextFieldProps, TextField } from "../TextField"
import { createAnimatedPropAdapter } from "react-native-reanimated"
import { Wheel } from "./Wheel"
import { $row, spacing } from "app/theme"

export interface DatePickerProps extends TextFieldProps {
  date?: Date
  onDateChange?: (date: Date) => void
  onDone?: (date: Date) => void
  action?: (props: {
    open: (defaultDate?: Date) => void
    close: () => void
    value?: Date
  }) => ReactNode
  minDate?: Date
  maxDate?: Date
  modalMode?: "date" | "time"
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

  const [_date, _setDate] = useState(date)
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
    if (_date) {
      onDateChange && onDateChange(_date)
      props.onDone && props.onDone(_date)
    }
  }

  const renderAction = useCallback(() => {
    if (!action) return undefined
    return action({
      open: (defaultDate) => {
        if(defaultDate && _date === undefined){
          _setDate(defaultDate)
        }
        setModalVisibility(true)
      },
      close: handleClose,
      value: _date,
    })
  }, [action, _date])

  useEffect(() => {
    if (date) {
      _setDate(date)
    }
  }, [date])

  return (
    <>
      {action ? (
        renderAction()
      ) : (
        <TextField
          ref={ref}
          style={$leftAlien}
          value={_date ? formatDateIR(_date) : undefined}
          {...TextInputProps}
          onFocus={() => {
            setModalVisibility(true)
          }}
          showSoftInputOnFocus={false}
        />
      )}

      <Portal>
        <Dialog visible={modalVisibility} onDismiss={handleClose}>
          <Dialog.Title>انتخاب زمان</Dialog.Title>

          <Dialog.Content
            style={{ borderColor: err ? "red" : undefined, borderWidth: err ? 1 : 0 }}
          >
            <DatePickerModal
              defaultTab={modalMode}
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
  value?: Date
  onValueChange: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  defaultTab?: "time" | "date"
}

/**
 * Model for selecting date
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/Card/}
 * @param {DatePickerModalProps} props - The props for the `DatePicker` component.
 * @returns {JSX.Element} The rendered `DatePicker` component.
 */
export const DatePickerModal = memo(function DatePickerModal(props: DatePickerModalProps) {
  const { value, onValueChange, defaultTab = "date" } = props
  const [tab, changeTab] = useState(defaultTab)
  return (
    <>
      <View style={[$row, { justifyContent: "flex-start", marginBottom: spacing.md }]}>
        <Chip
          showSelectedOverlay
          showSelectedCheck={false}
          selected={tab === "date"}
          onPress={() => changeTab("date")}
          style={{ marginStart: spacing.xxs }}
        >
          تاریخ
        </Chip>
        <Chip
          showSelectedOverlay
          showSelectedCheck={false}
          selected={tab === "time"}
          onPress={() => changeTab("time")}
          style={{ marginStart: spacing.xxs }}
        >
          ساعت
        </Chip>
      </View>
      {tab === "date" && (
        <View style={$dpkContentContainer}>
          <Wheel
            range={[1398, 1405]}
            value={value && getYear(value)}
            onScroll={(i) => {
              onValueChange(setYear(value || new Date(), i))
            }}
          ></Wheel>

          <Text style={{ alignSelf: "center" }} variant="labelLarge">
            ٫
          </Text>
          <Wheel
            range={[1, 12]}
            value={value && getMonth(value) + 1}
            onScroll={(i) => {
              onValueChange(setMonth(value || new Date(), i - 1))
            }}
          ></Wheel>
          <Text style={{ alignSelf: "center" }} variant="labelLarge">
            ٫
          </Text>
          <Wheel
            range={[1, 31]}
            value={value && getDate(value)}
            onScroll={(i) => {
              onValueChange(setDate(value || new Date(), i))
            }}
          ></Wheel>
        </View>
      )}
      {tab === "time" && (
        <View style={$dpkContentContainer}>
          <Wheel
            range={[0, 24]}
            value={value && getHours(value)}
            onScroll={(i) => {
              onValueChange(setHours(value || new Date(), i))
            }}
          ></Wheel>

          <Text style={{ alignSelf: "center" }} variant="labelLarge">
            :
          </Text>
          <Wheel
            range={[0, 60]}
            value={value && getMinutes(value)}
            onScroll={(i) => {
              onValueChange(setMinutes(value || new Date(), i))
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
}
