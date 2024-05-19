import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { TextInput, TextStyle, View, ViewStyle } from "react-native"
import { Text } from "../Text"
import {
  newDate,
  getYear,
  getDate,
  getMonth,
  min,
  max,
  getHours,
  getMinutes,
  getSeconds,
  differenceInDays,
} from "date-fns-jalali"
import { formatDateIR } from "app/utils/formatDate"
import { Button, useTheme, Portal, Dialog } from "react-native-paper"
import { TextFieldProps, TextField } from "../TextField"
import { createAnimatedPropAdapter } from "react-native-reanimated"
import { Wheel } from "./Wheel"
import { differenceInMinutes } from "date-fns"

export interface DatePickerProps extends TextFieldProps {
  date?: Date
  onDateChange?: (date: Date) => void
  onDone?: (date: Date) => void
  action?: (props: { open: () => void; close: () => void; value: Date }) => ReactNode
  minDate?: Date
  maxDate?: Date
}

/**
 * A component that allows for the entering and editing of text.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/TextField/}
 * @param {TextFieldProps} props - The props for the `TextField` component.
 * @returns {JSX.Element} The rendered `TextField` component.
 */
export const DatePicker = (props: DatePickerProps) => {
  const { date, onDateChange, action, minDate, maxDate, ...TextInputProps } = props
  const ref = useRef<TextInput>(null)

  const [_date, _setDate] = useState(date || new Date())

  const [modalVisibility, setModalVisibility] = useState(false)

  const handleDateChange = (value: Date) => {
    let res: Date = value
    if (!!maxDate) {
      res = min([value, maxDate])
    }
    if (!!minDate) {
      res = max([value, minDate])
    }
    _setDate(res)
    // onDateChange && onDateChange(res)
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
      value: date || new Date(),
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

          <Dialog.Content>
            <DatePickerModal
              maxDate={maxDate}
              minDate={minDate}
              value={_date}
              onValueChange={handleDateChange}
            ></DatePickerModal>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleClose}>ثبت</Button>
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
export function DatePickerModal(props: DatePickerModalProps) {
  const { value, onValueChange, minDate, maxDate, showDate = true, showTime = false } = props
  const [year, setYear] = useState(getYear(value))
  const [month, setMonth] = useState(getMonth(value) + 1)
  const [day, setDay] = useState(getDate(value))
  const [hour, setHour] = useState(getHours(value))
  const [minute, setMinute] = useState(getMinutes(value))
  const [second, setSecond] = useState(getSeconds(value))

  const selectedDate = useMemo(() => {
    const date = newDate(year, month - 1, day, hour, minute, second)
    onValueChange(date)
    return date
  }, [year, month, day, hour, minute, second])

  const minDay = useMemo(() => {
    let base = 1
    if (!minDate) {
      return base
    }
    if (getYear(minDate) < year || getMonth(minDate) + 1 < month) {
      return base
    }
    return getDate(minDate)
  }, [month, minDate, year])

  const maxDay = useMemo<number>(() => {
    let base = month < 7 ? 31 : 30
    if (!maxDate) {
      return base
    }
    if (getYear(maxDate) > year || getMonth(maxDate) + 1 > month) {
      return base
    }
    return Math.min(getDate(maxDate), base)
  }, [month, maxDate, year])

  const minMonth = useMemo(() => {
    let base = 1
    if (!minDate) {
      return base
    }
    if (getYear(minDate) < year) {
      return base
    }
    return getMonth(minDate) + 1
  }, [minDate, year])

  const maxMonth = useMemo(() => {
    let base = 12
    if (!maxDate) {
      return base
    }
    if (getYear(maxDate) > year) {
      return base
    }
    return Math.min(getMonth(maxDate) + 1, base)
  }, [month, maxDate, year])

  const maxHour = useMemo(() => {
    if (!maxDate) {
      return 24
    }
    if (1 > differenceInDays(selectedDate, maxDate)) {
      return getHours(maxDate)
    }
  }, [selectedDate, maxDate])

  const minHour = useMemo(() => {
    if (!minDate) {
      return 24
    }
    if (1 > differenceInDays(selectedDate, minDate)) {
      return getHours(minDate)
    }
  }, [selectedDate, minDate])

  const maxMinute = useMemo(() => {
    if (!maxDate) {
      return 24
    }
    if (1 > differenceInMinutes(selectedDate, maxDate)) {
      return getMinutes(maxDate)
    }
  }, [selectedDate, maxDate])

  const minMinute = useMemo(() => {
    if (!minDate) {
      return 24
    }
    if (1 > differenceInMinutes(selectedDate, minDate)) {
      return getMinutes(minDate)
    }
  }, [selectedDate, minDate])

  const maxSecond = useMemo(() => {
    if (!maxDate) {
      return 24
    }
    if (1 > differenceInMinutes(selectedDate, maxDate)) {
      return getSeconds(maxDate)
    }
  }, [selectedDate, maxDate])

  const minSecond = useMemo(() => {
    if (!minDate) {
      return 24
    }
    if (1 > differenceInMinutes(selectedDate, minDate)) {
      return getSeconds(minDate)
    }
  }, [selectedDate, minDate])

  useEffect(() => {
    setYear(getYear(value))
    setMonth(getMonth(value) + 1)
    setDay(getDate(value))
    setHour(getHours(value))
    setMinute(getMinutes(value))
    setSecond(getSeconds(value))
  }, [])

  return (
    <>
      {showDate && (
        <View style={$dpkContentContainer}>
          <Wheel
            min={(minDate && getYear(minDate)) || 1398}
            max={(maxDate && getYear(maxDate)) || 1405}
            range={[1398, 1405]}
            defaultValue={year}
            onSelect={(i) => {
              setYear(i)
            }}
          ></Wheel>

          <Text style={{ alignSelf: "center" }} variant="labelLarge">
            ٫
          </Text>
          <Wheel
            min={minMonth}
            max={maxMonth}
            range={[1, 12]}
            defaultValue={month}
            onSelect={(i) => {
              setMonth(i)
            }}
          ></Wheel>
          <Text style={{ alignSelf: "center" }} variant="labelLarge">
            ٫
          </Text>
          <Wheel
            range={[1, 31]}
            min={minDay}
            max={maxDay}
            defaultValue={day}
            onSelect={(i) => {
              setDay(i)
            }}
          ></Wheel>
        </View>
      )}
      {showTime && (
        <View style={$dpkContentContainer}>
          <Wheel
            min={minHour}
            max={maxHour}
            range={[0, 24]}
            defaultValue={hour}
            onSelect={(i) => {
              setHour(i)
            }}
          ></Wheel>

          <Text style={{ alignSelf: "center" }} variant="labelLarge">
            :
          </Text>
          <Wheel
            min={minMinute}
            max={maxMinute}
            range={[0, 60]}
            defaultValue={minute}
            onSelect={(i) => {
              setMinute(i)
            }}
          ></Wheel>
          <Text style={{ alignSelf: "center" }} variant="labelLarge">
            :
          </Text>
          <Wheel
            range={[0, 60]}
            min={minSecond}
            max={maxSecond}
            defaultValue={second}
            onSelect={(i) => {
              setSecond(i)
            }}
          ></Wheel>
        </View>
      )}
    </>
  )
}

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
