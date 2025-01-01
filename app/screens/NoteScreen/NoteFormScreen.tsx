import React, { FC, useMemo, useLayoutEffect, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, Screen, Text, TextField, DatePicker } from "app/components"
import { Divider, Surface, Appbar } from "react-native-paper"
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { useObject, useRealm } from "@realm/react"
import { Alert } from "react-native"
import { Note } from "app/models/realm/note"
import { BSON, UpdateMode } from "realm"
import { Project } from "app/models/realm/calendar"
import { format } from "date-fns-jalali"
import { Select } from "../CalendarScreen/Select"
interface NoteFormScreenProps extends AppStackScreenProps<"NoteForm"> { }

export const NoteFormScreen: FC<NoteFormScreenProps> = observer(function NoteFormScreen({ route: { params } }) {
  // Pull in one of our MST stores
  const { noteStore: { form }, calendarStore: { currentProjectId, currentDate } } = useStores()
  const realm = useRealm()
  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      return () => {
        form.reset()
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, [])
  );

  const project = useObject(Project, new BSON.ObjectID(currentProjectId))


  const saveNote = () => {
    if (form.valid().length < 1) {
      try {
        const res = realm.write(() => {
          return realm.create(
            Note,
            {
              _id: params.itemId ? new BSON.ObjectID(params.itemId) : new BSON.ObjectID(),
              project: project,
              title: form.title.value,
              text: form.text.value, isDone: self.isDone,
              isDraft: false,
              happendAt: form.happenedAt.value,
            },
            params.itemId ? UpdateMode.Modified : undefined,
          )
        })
        navigation.navigate("NoteHome", { itemId: res._id.toHexString(), op: params.itemId ? "update" : "create" })
        return res
      } catch (e: any) {
        Alert.alert("save failed", e.toString())
      }
    }
  }

  const errorMap = useMemo(() => {
    let s = {}
    form.error.forEach(i => {
      s[i.key] = i.msg
    })
    return s
  }, [form.error])

  // Pull in navigation via hook
  const navigation = useNavigation()

  useEffect(() => {
    form.happenedAt.setValue(currentDate)
  }, [currentDate])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => {
              navigation.canGoBack() && navigation.goBack()
            }}
          />
          <Appbar.Content title={""} />
          <Appbar.Action
            icon="check"
            onPress={saveNote}
          />
        </Appbar.Header>
      ),
    })
  })
  return (
    <Surface style={{ flex: 1 }}>
      <DatePicker
        date={form.happenedAt.value}
        modalMode="date"
        onDateChange={(value) => {
          form.happenedAt.setValue(value)
        }}

        action={({ open, close, value }) => {
          return (
            <Select
              selected={value && format(value, "MM٫dd")}
              placeholder={"اختیاری"}
              onPress={() => open()}

            />
          )
        }}
      />
      <Divider />
      <TextField
        dense
        placeholder="تیتر"
        defaultValue={form.title.default}
        value={form.title.value}
        error={form.title.invalid}
        onChangeText={(value) => {
          form.title.setValue(value)
        }}
        helper={errorMap["title"]}
        outlineColor="transparent"
        contentStyle={{ paddingTop: 10 }}
        outlineStyle={{ display: "none" }
        }
      />
      <Divider />
      <TextField
        autoFocus
        defaultValue={form.text.default}
        value={form.text.value}
        error={form.text.invalid}
        onChangeText={(value) => {
          form.text.setValue(value)
        }}
        helper={errorMap["text"]}

        contentStyle={{ paddingTop: 10 }}
        style={{ minHeight: "80%" }}
        placeholder="متن"
        outlineStyle={{ display: "none" }}
        outlineColor="transparent"
        dense
        multiline
      />
      <Text>
        {JSON.stringify(form.error)}
      </Text>
    </Surface>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
