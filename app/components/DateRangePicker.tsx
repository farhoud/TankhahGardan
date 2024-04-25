import React, {
  useEffect,
  useState,
} from "react"
import {
  Modal,
  StyleProp,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { Text } from "./Text"
import { newDate, getYear, getDate, getMonth } from "date-fns-jalali"
import { Icon } from "./Icon"
import { Button } from "./Button"
import { formatDateIR } from "app/utils/formatDate"

export interface DateRangePickerProps {
  start?: Date
  onStartChange?: (date: Date) => void
  end?: Date
  onEndChange?: (date: Date) => void
  /**
   * A style modifier for different input states.
   */
  status?: "disabled"
  /**
   * Optional input style override.
   */
  style?: StyleProp<TextStyle>
}

/**
 * A component that allows for the entering and editing of text.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/TextField/}
 * @param {TextFieldProps} props - The props for the `TextField` component.
 * @returns {JSX.Element} The rendered `TextField` component.
 */
export function DateRangePicker(props: DateRangePickerProps) {
  const { start, end, onStartChange, onEndChange } = props
  const [visible, setVisible] = useState(false)

  const formatLabel = () => {
    const startStr = start ? formatDateIR(start) : "ندارد"
    const endStr = end ? formatDateIR(end) : "ندارد"
    return (
      <Text
        preset="formLabel"
        style={{ direction: "rtl", textAlign: "right" }}
        text={`${startStr} تا ${endStr}`}
      />
    )
  }

  return (
    <>
      <Modal transparent visible={visible}>
        <View style={$centeredView}>
          <View style={$dpkContainer}>
            <View style={$dpkContentContainer}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <DatePickerInput value={start || new Date()} onValueChange={onStartChange} />
                <Text>تا</Text>
                <DatePickerInput value={end || new Date()} onValueChange={onEndChange} />
              </View>
            </View>
            <View style={$dpkContentActions}>
              <Button
                tx="common.ok"
                onPress={() => {
                  setVisible(false)
                }}
              ></Button>
            </View>
          </View>
        </View>
      </Modal>

      <Button
        preset={"default"}
        // style={{ width: "100%" }}
        onPress={() => {
          setVisible(true)
        }}
        RightAccessory={() => {
          return <Icon style={{ marginLeft: 10 }} icon="dateRange"></Icon>
        }}
      >
        {formatLabel()}
      </Button>
    </>
  )
}

interface DatePickerModalProps {
  value: Date
  onValueChange?: (date: Date) => void
}

/**
 * Model for selecting date
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/Card/}
 * @param {DatePickerModalProps} props - The props for the `DatePicker` component.
 * @returns {JSX.Element} The rendered `DatePicker` component.
 */
export function DatePickerInput(props: DatePickerModalProps) {
  const { value, onValueChange } = props
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
    onValueChange && onValueChange(date)
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
    <View style={{ display: "flex", flexDirection: "row" }}>
      <View style={$dpkController}>
        <TouchableOpacity style={$dpkIconBtn} onPress={() => changeValue(year, true, setYear, 4)}>
          <Icon icon={"caretUp"}></Icon>
        </TouchableOpacity>
        <TextInput
          style={$dpkInput}
          onChangeText={(data) => setYear(data)}
          value={year}
          keyboardType="numeric"
          maxLength={4}
        ></TextInput>
        <TouchableOpacity style={$dpkIconBtn} onPress={() => changeValue(year, false, setYear, 4)}>
          <Icon icon={"caretDown"}></Icon>
        </TouchableOpacity>
      </View>
      <View style={$dpkController}>
        <TouchableOpacity style={$dpkIconBtn} onPress={() => changeValue(month, true, setMonth, 2)}>
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
        <TouchableOpacity style={$dpkIconBtn} onPress={() => changeValue(day, true, setDay, 2)}>
          <Icon icon={"caretUp"}></Icon>
        </TouchableOpacity>
        <TextInput
          style={$dpkInput}
          value={day}
          onChangeText={(data) => setDay(data)}
          keyboardType="numeric"
          maxLength={2}
        ></TextInput>
        <TouchableOpacity style={$dpkIconBtn} onPress={() => changeValue(day, false, setDay, 2)}>
          <Icon icon={"caretDown"}></Icon>
        </TouchableOpacity>
      </View>
    </View>
  )
}
const $centeredView: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
  alignContent: "center",
  flexDirection: "column",
}

const $dpkContainer: ViewStyle = {
  // margin: 20,
  alignSelf: "center",
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
  height: "50%",
  width: "80%",
}

const $dpkContentContainer: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  flex: 1,
}

const $dpkContentActions: ViewStyle = {}

const $dpkController: ViewStyle = {
  display: "flex",
  flexDirection: "column",
  // flex: 1,
  alignItems: "center",
  // justifyContent: "space-between",
}

const $dpkInput = {
  fontSize: 16,
}

const $dpkIconBtn: ViewStyle = { padding: 10, borderRadius: 180 }
