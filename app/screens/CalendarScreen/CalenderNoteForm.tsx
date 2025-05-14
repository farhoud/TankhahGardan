import React, { useCallback } from "react"
import { View } from "react-native"
import { AppNavigation } from "app/navigators"
import { Button, DatePicker, TextField } from "app/components"
import { $row, spacing } from "app/theme"
import { Divider, TextInput, useTheme } from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { format } from "date-fns"
import { useObject, useRealm } from "@realm/react"
import { CalenderNote, Project } from "app/models/realm/calendar"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import { Select } from "./Select"
import { BSON } from "realm"

interface CalenderNoteFormProps {
  onDone?: (value: CalenderNote) => void
}

export const CalenderNoteForm = observer(function CalenderNoteForm(_props: CalenderNoteFormProps) {
  const { onDone } = _props
  // Pull in one of our MST stores
  const {
    calendarStore: {
      currentDate,
      noteForm: {
        projectId,
        at,
        text,
        title,
        submit,
        setProp,
        isValid,
      },
      setProp: setCalendarProps,
    },
  } = useStores()

  // const keyboard = useAnimatedKeyboard();
  // Pull in navigation via hook
  const navigation = useNavigation<AppNavigation>()

  const theme = useTheme()

  const realm = useRealm()

  const project = useObject(Project, new BSON.ObjectID(projectId))


  const renderDatePickerAction = useCallback(
    ({ open, clear, value }: {
      open: (defaultDate?: Date) => void
      close: () => void
      value?: Date
      clear: () => void
    }) => {
      return (
        <Select
          selected={value && format(value, "HH:mm")}
          placeholder={"تاریخ"}
          icon={"clock"}
          onPress={() => open(currentDate)}
          // onClear={() => clear()}
        />
      )
    },
    [currentDate],
  )
  return (
    <>
      <View
        style={[
          $row,
          { justifyContent: "space-between", alignItems: "center", paddingHorizontal: 10 },
        ]}
      >
        <Button
          mode="contained-tonal"
          style={{ marginBottom: spacing.sm }}
          disabled={!isValid}
          onPress={() => {
            if (project) {
              const res = submit(realm, project)
              onDone && res && onDone(res)
            }
          }}
        >
          ذخیره
        </Button>
      </View>

      <TextField
        dense
        autoFocus={!title.touched}
        placeholder="عنوان"
        value={title.value?.toString()}
        onChangeText={(value) => {
          title.setProp("value", value)
          if (!value && title.touched) {
            title.setProp("error", true)
            title.setProp("msg", "این فیلد الزامیست")
          } else {
            if (title.error) {
              title.setProp("error", false)
            }
            if (title.msg) {
              title.setProp("msg", undefined)
            }
          }
        }}
        defaultValue={title.default?.toString()}
        error={title.error}
        helper={title.msg}
        onFocus={() => {
          title.setProp("touched", true)
        }}
        onBlur={() => {
          if (!title.value) {
            title.setProp("error", true)
            title.setProp("msg", "این فیلد الزامیست")
          }
        }}
        // outlineColor="transparent"
        outlineStyle={{ display: "none" }}
      />
      <Divider />
      <Select
        onPress={() => {
          setCalendarProps("selecting", true)
          navigation.navigate("ProjectList", { mode: "select" })
        }}
        selected={project ? project.name : undefined}
        placeholder={"انتخاب پروژه"}
        icon={"domain"}
      />
      <Divider />
      <DatePicker
        clearButtonMode="always"
        date={at}
        onDateChange={(value) => {
          setProp("at", value)
        }}
        modalMode="time"
        action={renderDatePickerAction}
      />
      <Divider />
      <TextField
        // dense
        left={<TextInput.Icon icon="text-long" />}
        placeholder="توضیحات"
        value={text}
        onChangeText={(value) => {
          setProp("text", value)
        }}
        multiline
        numberOfLines={1}
        textContentType="none"
        outlineColor="transparent"
        outlineStyle={{ display: "none" }}
        style={{ ...theme.fonts.bodyMedium }}
      />

      <Divider />
    </>
  )
})
