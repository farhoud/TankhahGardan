import React, { useMemo } from "react"
import { View } from "react-native"
import { AppNavigation } from "app/navigators"
import { AutoComplete, Button, DatePicker, TextField, Text } from "app/components"
import { $row, spacing } from "app/theme"
import { Icon, TextInput, useTheme } from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { format } from "date-fns"
import { BSON } from "realm"
import { useObject, useQuery, useRealm } from "@realm/react"
import { Attendance, Project, Worker } from "app/models/realm/calendar"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import { Select } from "./Select"

interface AttendanceFormProps {
  onDone?: (value: Attendance) => void
}

export const AttendanceForm = observer(function AttendanceForm(_props: AttendanceFormProps) {
  const { onDone } = _props
  // Pull in one of our MST stores
  const {
    calendarStore: {
      attendanceForm: { _id, from, to, description, workerId, submit, setProp, projectId },
      setProp: setCalendarProps
    },
  } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation<AppNavigation>()

  const theme = useTheme()

  const realm = useRealm()
  const worker = useObject(Worker, new BSON.ObjectID(workerId))
  const project = useObject(Project, new BSON.ObjectID(projectId))

  const isAvailable = useMemo(() => {
    const condition = worker?.attendance.filtered(
      "from BETWEEN {$0,$1} OR to BETWEEN {$0,$1}",
      from,
      to,
    )
    return !condition?.length
  }, [worker, from, to])

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
          onPress={() => {
            if (worker && project) {
              const res = submit(realm, worker, project)
              onDone && res && onDone(res)
            }
          }}
        >
          دخیره
        </Button>
      </View>
      <Select
        onPress={() => {
          setCalendarProps("selecting", true)
          navigation.navigate("ProjectList", { mode: "select" })
        }}
        selected={project ? project.name : undefined}
        placeholder={"انتخاب پروژه"}
        icon={"domain"}
      />
      <Select
        onPress={() => {
          setCalendarProps("selecting", true)
          navigation.navigate("Worker", { mode: "select" })
        }}
        selected={worker ? worker.name : undefined}
        placeholder={"انتخاب نیرو"}
        icon={"account"}
        error={!isAvailable && !_id ? "در این بازه زمانی مشغول است" : undefined}
      />
      <View
        style={{
          justifyContent: "flex-start",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <DatePicker
          date={from}
          onDateChange={(value) => {
            setProp("from", value)
          }}
          modalMode="time"
          action={({ open, close, value }) => {
            return (
              <Select
                selected={value && format(value, "HH:mm")}
                placeholder={"اختیاری"}
                icon={"clock-in"}
                onPress={() => open()}
              />
            )
          }}
        />
        <DatePicker
          date={to}
          modalMode="time"
          onDateChange={(value) => {
            setProp("to", value)
          }}
          action={({ open, close, value }) => {
            return (
              <Select
              selected={value && format(value, "HH:mm")}
              placeholder={"اختیاری"}
              icon={"clock-out"}
              onPress={() => open()}
            />
            )
          }}
        />
      </View>
      <TextField
        placeholder="توضیحات"
        left={<TextInput.Icon icon="text-long" />}
        value={description}
        onChangeText={(value) => {
          setProp("description", value)
        }}
        multiline
        numberOfLines={2}
        outlineColor="transparent"
        outlineStyle={{ display: "none" }}
        dense
        style={{ ...theme.fonts.bodyMedium }}
      />
    </>
  )
})
