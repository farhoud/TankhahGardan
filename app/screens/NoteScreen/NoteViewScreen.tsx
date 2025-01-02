import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text } from "app/components"
import { Card, IconButton, Surface } from "react-native-paper"
import { useObject, useRealm } from "@realm/react"
import { Note } from "app/models/realm/note"
import { BSON } from "realm"
import { Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"

interface NoteViewScreenProps extends AppStackScreenProps<"NoteView"> { }

export const NoteViewScreen: FC<NoteViewScreenProps> = observer(function NoteViewScreen(_props) {
  const { route: { params } } = _props
  // Pull in one of our MST stores
  const { noteStore: { form } } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation()

  // Pull in realm
  const realm = useRealm()
  const note = useObject(Note, new BSON.ObjectID(params.itemId))

  const deleteNote = () => {
    realm.write(() => {
      try {

        realm.delete(note)
        if (navigation.canGoBack()) {
          navigation.goBack()
        } else {
          navigation.navigate("NoteHome", {})
        }
      } catch (e: any) {
        Alert.alert(e)
      }
    })
  }
  const editNote = () => {
    form.reset()
    form.title.setValue(note.title)
    form.text.setValue(note.text)
    form.happenedAt.setValue(note.happendAt)

    navigation.navigate("NoteForm", { itemId: note._id.toHexString() })
  }

  return (

    <Screen style={$root} preset="fixed">
      <Surface>
        {note ?
          <Card>
            <Card.Title title={note?.title}>
            </Card.Title>
            <Card.Content>
              <Text variant="bodyMedium"> {note.text}</Text>
            </Card.Content>
            <Card.Actions>
              <IconButton icon={"delete"} onPress={deleteNote}></IconButton>
              <IconButton icon={"pencil"} onPress={editNote} />
            </Card.Actions>
          </Card> : <Text>Not Found</Text>}
      </Surface>
    </Screen >
  )
})

const $root: ViewStyle = {
  flex: 1,
}
