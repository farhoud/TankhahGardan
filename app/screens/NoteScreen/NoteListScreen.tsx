import React, { FC, useCallback, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppTabScreenProps, AppNavigation } from "app/navigators"
import { Button, DatePicker, ListView, TimeIndicator, Text } from "app/components"
import {
  Appbar,
  Card,
  Divider,
  Drawer,
  FAB,
  Icon,
  IconButton,
  List,
  Surface,
  Dialog,
  Portal,
  useTheme,
  Title,
} from "react-native-paper"
import { useRealm, useQuery } from "@realm/react"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { Project } from "app/models/realm/calendar"
import { addDays, startOfDay, endOfDay } from "date-fns-jalali"
import { formatDateIRDisplay } from "app/utils/formatDate"
import { Note } from "app/models/realm/note"
import { BSON } from "realm"

export const NoteListScreen: FC<AppTabScreenProps<"NoteHome">> = observer(function NoteListScreen() {
  const {
    calendarStore: { setProp, currentDate, selectProjectId, currentView },
    noteStore: { form }
  } = useStores()
  // Pull in navigation via hook
  const navigation = useNavigation<AppNavigation>()
  // Pull in real via hook
  const realm = useRealm()
  const theme = useTheme()

  // states
  const [projectIndex, setProjectIndex] = useState(0)
  const [projectSelectVisible, setProjectVisible] = useState(false)

  // queries
  const projects = useQuery(Project, (col) => {
    return col.filtered("deleted != $0", true)
  })

  const notes = useQuery(Note, (col) => {
    return col
      .filtered(
        "project._id == $0",
        projects[projectIndex] ? projects[projectIndex]._id : new BSON.ObjectID(),
      )
      .filtered(
        "happendAt BETWEEN {$0 , $1}",
        startOfDay(currentDate),
        endOfDay(currentDate),
      )
  }, [currentDate, projectIndex, projects])

  // actions
  const changeSelectProjectVisibility = (visibility: boolean) => () => {
    setProjectVisible(visibility)
  }

  const changeProject = (projectIndex: number) => () => {
    setProjectIndex(projectIndex)
    selectProjectId(projects[projectIndex]._id.toHexString())
    setProjectVisible(false)
  }

  const openNewNoteForm = () => () => {
    navigation.navigate("NoteForm", {})
  }

  const openEditNoteForm = (note: Note) => () => {
    form.reset()
    form.title.setValue(note.title)
    form.text.setValue(note.text)
    form.happenedAt.setValue(note.happendAt)

    navigation.navigate("NoteForm", { itemId: note._id.toHexString() })
  }

  // renders 
  const renderSelectProject = useCallback(() => (
    <Portal>
      <Dialog visible={projectSelectVisible} onDismiss={changeSelectProjectVisibility(false)}>
        <Dialog.ScrollArea>
          <ListView
            style={{ maxHeight: 100 }}
            data={projects.map(i => i)}
            renderItem={(info) => (
              <List.Item
                title={info.item.name}
                onPress={changeProject(info.index)}
              />
            )}
          />
        </Dialog.ScrollArea>
      </Dialog>
    </Portal>

  ), [projects, projectSelectVisible])

  const renderHeader = useCallback(() => (
    <Appbar.Header elevated>
      <Button
        mode="contained-tonal"
        icon="arrow-down-circle"
        labelStyle={theme.fonts.bodySmall}
        text={(projects[projectIndex] && projects[projectIndex].name) || "ندارد"}
        onPress={changeSelectProjectVisibility(true)}
      />
      <Appbar.Content title="" />
      <Appbar.Action
        mode="contained-tonal"
        icon="arrow-right-circle"
        onPress={() => {
          setProp("currentDate", addDays(currentDate, 1))
        }}
      />
      <DatePicker
        date={currentDate}
        onDateChange={(value) => {
          setProp("currentDate", value)
        }}
        action={({ open, close, value }) => {
          return (
            <Button
              mode="contained-tonal"
              labelStyle={theme.fonts.bodySmall}
              text={value ? formatDateIRDisplay(value) : " : "}
              onPress={() => open()}
            />
          )
        }}
      />
      <Appbar.Action
        mode="contained-tonal"
        icon="arrow-left-circle"
        onPress={() => {
          setProp("currentDate", addDays(currentDate, -1))
        }}
      />
    </Appbar.Header>
  ), [currentDate, projectIndex, projects])



  return (
    <>
      {renderHeader()}
      {renderSelectProject()}
      <ListView
        data={notes.slice()}
        renderItem={(info) => (
          <List.Item
            title={info.item.title}
            onPress={openEditNoteForm(info.item)} />)} />

      <FAB style={$fab} onPress={openNewNoteForm()} icon="plus" />
    </>
  )
})

const $fab: ViewStyle = {
  position: "absolute",
  bottom: 16,
  right: 10,
  opacity: 0.7,
}
const $root: ViewStyle = {
  flex: 1,
}
