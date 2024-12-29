import React, { useCallback } from "react"
import { TouchableHighlight, View } from "react-native"
import { AppNavigation } from "app/navigators"
import { Button, DatePicker, TextField, Text } from "app/components"
import { $row, spacing } from "app/theme"
import { Checkbox, Chip, Divider, Icon, TextInput, useTheme } from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { format } from "date-fns"
import { useObject, useQuery, useRealm } from "@realm/react"
import { Project, Worker, Task } from "app/models/realm/calendar"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import { Select } from "./Select"
import { BSON } from "realm"

interface TaskFormProps {
  onDone?: (value: Task) => void
}

export const TaskForm = observer(function TaskForm(_props: TaskFormProps) {
  const { onDone } = _props
  // Pull in one of our MST stores
  const {
    calendarStore: {
      currentDate,
      deSelectWorker,
      taskForm: {
        projectId,
        isDone,
        description,
        workerObjIds,
        dueDate,
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
  const workers = useQuery(
    Worker,
    (res) => {
      return res.filtered("_id IN $0", workerObjIds)
    },
    [workerObjIds],
  )
  const project = useObject(Project, new BSON.ObjectID(projectId))

  const renderIcon = (src: string) => {
    return (
      <View style={{ marginStart: spacing.sm, paddingBottom: spacing.sm }}>
        <Icon source={src} size={28} color={theme.colors.onSurface} />
      </View>
    )
  }

  const renderButton = useCallback(
    (props: { text: string; icon: string; onPress: () => void }) => {
      const { text, icon, onPress } = props
      return (
        <TouchableHighlight onPress={onPress}>
          <View
            style={[
              $row,
              {
                justifyContent: "flex-start",
                alignItems: "center",
                paddingTop: spacing.sm,
                paddingBottom: spacing.xxs,
              },
            ]}
          >
            {renderIcon(icon)}
            {workers.length < 1 && (
              <Text variant="bodyMedium" style={{ marginStart: spacing.sm }}>
                {text}
              </Text>
            )}
            {workers.map((i) => (
              <Chip
                style={{ marginStart: spacing.xxs }}
                icon="close"
                key={i._objectKey()}
                onPress={(e) => {
                  e.preventDefault()
                  deSelectWorker(i._id.toHexString())
                }}
              >
                {i.name}
              </Chip>
            ))}
          </View>
        </TouchableHighlight>
      )
    },
    [workers, navigation],
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

            const res = submit(realm, workers.slice() || [], project || undefined)
            onDone && res && onDone(res)
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
        placeholder={"انتخاب پروژه (اختیاری)"}
        icon={"domain"}
      />
      <Divider />
      <DatePicker
        date={dueDate}
        modalMode="time"
        onDateChange={(value) => {
          setProp("dueDate", value)
        }}
        action={({ open, close, value }) => (
          <Select
            selected={value && format(value, "HH:mm")}
            placeholder={"سررسید (اختیاری)"}
            icon={"clock-check"}
            onPress={() => open(currentDate)}
          />
        )}
      />
      <Divider />
      {renderButton({
        icon: "account",
        text: "انتخاب نیرو (اختیاری)",
        onPress: () => {
          setCalendarProps("selecting", true)
          navigation.navigate("Worker", { mode: "select" })
        },
      })}
      <Divider />
      <TextField
        // dense
        left={<TextInput.Icon icon="text-long" />}
        placeholder="توضیحات (اختیاری)"
        value={description}
        onChangeText={(value) => {
          setProp("description", value)
        }}
        multiline
        numberOfLines={1}
        textContentType="none"
        outlineColor="transparent"
        outlineStyle={{ display: "none" }}
        style={{ ...theme.fonts.bodyMedium }}
      />
      <Divider />
      <Checkbox.Item
        status={isDone ? "checked" : "unchecked"}
        onPress={() => {
          setProp("isDone", !isDone);
        }}
        label="انجام شده"
      />
      <Divider />
    </>
  )
})
