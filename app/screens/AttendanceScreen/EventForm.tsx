import React, { useCallback } from "react"
import { TouchableHighlight, View } from "react-native"
import { AppNavigation } from "app/navigators"
import { AutoComplete, Button, DatePicker, TextField, Text } from "app/components"
import { $row, spacing } from "app/theme"
import { Chip, Divider, Icon, TextInput, useTheme } from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { format } from "date-fns"
import { useObject, useQuery, useRealm } from "@realm/react"
import { Event, Project, Worker } from "app/models/realm/calendar"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import { Select } from "./Select"
import { BSON } from "realm"

interface EventFormProps {
  onDone?: (value: Event) => void
}

export const EventForm = observer(function EventForm(_props: EventFormProps) {
  const { onDone } = _props
  // Pull in one of our MST stores
  const {
    calendarStore: {
      currentDate,
      currentProjectId,
      deSelectWorker,
      eventForm: {
        from,
        to,
        description,
        workerObjIds,
        process,
        unit,
        quantity,
        title,
        submit,
        setProp,
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
  const project = useObject(Project, new BSON.ObjectID(currentProjectId))

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
          onPress={() => {
            if (workers && project) {
              const res = submit(realm, workers.slice(), project)
              onDone && res && onDone(res)
            }
          }}
        >
          ذخیره
        </Button>
      </View>

      <TextField
        dense
        placeholder="عنوان"
        value={title}
        onChangeText={(value) => {
          setProp("title", value)
        }}
        outlineColor="transparent"
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
              icon={"clock"}
              onPress={() => open(currentDate)}
            />
          )
        }}
      />
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
      {renderButton({
        icon: "account",
        text: "انتخاب نیرو (اختیاری)",
        onPress: () => {
          setCalendarProps("selecting", true)
          navigation.navigate("Worker", { mode: "select" })
        },
      })}

      <Divider />
      <DatePicker
        date={to}
        modalMode="time"
        onDateChange={(value) => {
          setProp("to", value)
        }}
        action={({ open, close, value }) => (
          <Select
            selected={value && format(value, "HH:mm")}
            placeholder={"اختیاری"}
            icon={"clock-check"}
            onPress={() => open(currentDate)}
          />
        )}
      />
      <Divider />
      <TextField
        dense
        placeholder="فرایند (اختیاری)"
        value={process}
        onChangeText={(value) => {
          setProp("process", value)
        }}
        outlineColor="transparent"
        outlineStyle={{ display: "none" }}
        style={{ ...theme.fonts.bodyMedium }}
      />
      <Divider />
      <TextField
        placeholder="واحد (اختیاری)"
        value={unit}
        onChangeText={(value) => {
          setProp("unit", value)
        }}
        outlineColor="transparent"
        outlineStyle={{ display: "none" }}
        dense
        style={{ ...theme.fonts.bodyMedium }}
      />
      <Divider />
      <TextField
        dense
        placeholder="مقدار (اختیاری)"
        value={quantity?.toString()}
        onChangeText={(value) => {
          Number(value) && setProp("quantity", Number(value))
        }}
        keyboardType="numeric"
        outlineColor="transparent"
        outlineStyle={{ display: "none" }}
        style={{ ...theme.fonts.bodyMedium }}
      />
    </>
  )
})
