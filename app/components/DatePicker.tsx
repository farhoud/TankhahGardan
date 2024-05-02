import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import {
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { Text } from "./Text"
import { newDate, getYear, getDate, getMonth } from "date-fns-jalali"
import { formatDateIR } from "app/utils/formatDate"
import { Card, Button, Modal, useTheme, IconButton, Portal } from "react-native-paper"
import { TextFieldProps, TextField } from "./TextField"


export interface DatePickerProps extends TextFieldProps {
  date?: Date
  onDateChange?: (date: Date) => void
  onDone?: (date: Date) => void
  action?: (props: { open: () => void; close: () => void; value: Date }) => ReactNode
}

/**
 * A component that allows for the entering and editing of text.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/TextField/}
 * @param {TextFieldProps} props - The props for the `TextField` component.
 * @returns {JSX.Element} The rendered `TextField` component.
 */
export const DatePicker = (props: DatePickerProps) => {
  const { date, onDateChange, action, ...TextInputProps } = props
  const ref = useRef<TextInput>(null)

  const [_date, _setDate] = useState(date || new Date())

  const [modalVisibility, setModalVisibility] = useState(false)

  const handleDateChange = (value: Date) => {
    _setDate(value)
    onDateChange && onDateChange(value)
  }

  const handleClose = () => {
    setModalVisibility(false)
    props.onDone && props.onDone(_date)
  }

  const renderAction = useCallback(() => {
    if (!action)
      return undefined  
    return action({ open: () => setModalVisibility(true), close: handleClose, value: _date })
    
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
          value={formatDateIR(_date)}
          {...TextInputProps}
          onFocus={(e) => {
            setModalVisibility(true)
            // Keyboard.dismiss()
          }}
          onSubmitEditing={(e) => console.log(e)}
          showSoftInputOnFocus={false}
        />
      )}

      <Portal>
        <Modal
          visible={modalVisibility}
          onDismiss={handleClose}
          contentContainerStyle={{ padding: 20 }}
        >
          <Card mode="contained">
            <Card.Title title="انتخاب تاریخ"></Card.Title>
            <Card.Content>
              <DatePickerModal value={_date} onValueChange={handleDateChange}></DatePickerModal>
            </Card.Content>
            <Card.Actions>
              <Button onPress={handleClose}>ثبت</Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
    </>
  )
}

interface DatePickerModalProps {
  value: Date
  onValueChange: (date: Date) => void
}

/**
 * Model for selecting date
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/Card/}
 * @param {DatePickerModalProps} props - The props for the `DatePicker` component.
 * @returns {JSX.Element} The rendered `DatePicker` component.
 */
export function DatePickerModal(props: DatePickerModalProps) {
  const { value, onValueChange } = props
  const theme = useTheme()
  const [year, setYear] = useState(getYear(value).toString())
  const [month, setMonth] = useState((getMonth(value) + 1).toString().padStart(2, "0"))
  const [day, setDay] = useState(getDate(value).toString().padStart(2, "0"))

  const $textStyle: TextStyle = { color: theme.colors.inverseSurface, ...theme.fonts.default }

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

  useEffect(() => {
    setYear(getYear(value).toString())
    setMonth((getMonth(value) + 1).toString().padStart(2, "0"))
    setDay(getDate(value).toString().padStart(2, "0"))
  }, [value])

  return (
    <>
      <View style={$dpkContentContainer}>
        <View style={$dpkController}>
          <IconButton
            icon="chevron-up"
            size={30}
            onPress={() => changeValue(year, true, setYear, 4)}
          />
          <TextInput
            style={[$dpkInput, $textStyle]}
            onChangeText={(data) => setYear(data)}
            value={year}
            keyboardType="numeric"
            maxLength={4}
          />
          <IconButton
            icon="chevron-down"
            size={30}
            onPress={() => changeValue(year, false, setYear, 4)}
          />
        </View>
        <Text style={{ alignSelf: "center" }} variant="labelLarge">
          ٫
        </Text>
        <View style={$dpkController}>
          <IconButton
            icon="chevron-up"
            size={30}
            onPress={() => changeValue(month, true, setMonth, 2)}
          />
          <TextInput
            style={[$dpkInput, $textStyle]}
            onChangeText={(data) => setMonth(data)}
            value={month}
            keyboardType="numeric"
            maxLength={2}
          />
          <IconButton
            icon="chevron-down"
            size={30}
            onPress={() => changeValue(month, false, setMonth, 2)}
          />
        </View>
        <Text style={{ alignSelf: "center" }} variant="labelLarge">
          ٫
        </Text>
        <View style={$dpkController}>
          <IconButton
            onPress={() => changeValue(day, true, setDay, 2)}
            icon="chevron-up"
            size={30}
          />
          <TextInput
            style={[$dpkInput, $textStyle]}
            value={day}
            onChangeText={(data) => setDay(data)}
            keyboardType="numeric"
            maxLength={2}
          />
          <IconButton
            onPress={() => changeValue(day, false, setDay, 2)}
            icon="chevron-down"
            size={30}
          />
        </View>
      </View>
    </>
  )
}

const $dpkContentContainer: ViewStyle = {
  display: "flex",
  flexDirection: "row-reverse",
  paddingHorizontal: 50,
  paddingVertical: 10,
}

const $dpkController: ViewStyle = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  alignItems: "center",
  // justifyContent: "space-between",
}

const $dpkInput = {
  fontSize: 18,
  fontFamily: "IRANSansXFaNum-Regular",
}
