import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackParamList, AppStackScreenProps } from "app/navigators"
import { Screen, Text } from "app/components"
import { useRoute, RouteProp } from "@react-navigation/native"
import { useObject } from "@realm/react"
import { Attendance, CalenderNote } from "app/models/realm/calendar"
import { CalendarItemEnum } from "app/models"
import { BSON } from "realm"
import { Card } from "react-native-paper"
import { formatDateIR } from "app/utils/formatDate"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

interface CalendarItemScreenProps extends AppStackScreenProps<"CalendarItem"> { }

export const CalendarItemScreen: FC<CalendarItemScreenProps> = observer(function CalendarItemScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()

  const { params: { itemId, itemType } } = useRoute<RouteProp<AppStackParamList, "CalendarItem">>()

  const item = useObject<CalenderNote | Attendance>(itemType === CalendarItemEnum.attendance ? Attendance : CalenderNote, new BSON.ObjectId(itemId))

  const renderAttedace = () => {
    const attendance = item as Attendance
    return (<Card>
      <Card.Title title={attendance.worker.name} subtitle={attendance.project.name + " - " + formatDateIR(attendance.from)}></Card.Title>
      <Card.Content>
        <View style={{ flexDirection: "row", padding: 20 }}>
          {attendance.to && <Text variant="bodyLarge">{` - ${formatDateIR(attendance.to, "HH:mm")}`}</Text>}
          <Text variant="bodyLarge">{`${formatDateIR(attendance.from, "HH:mm")}`}</Text>
        </View>
        {attendance.description && <Text variant="bodyLarge">{`${attendance.description}`}</Text>}
      </Card.Content>
    </Card>)
  }

  const renderNote = () => {
    const note = item as CalenderNote
    return (<Card>
      <Card.Title title={note.title} subtitle={note.project.name + " - " + formatDateIR(note.at)} />
      <Card.Content>
        <View style={{ padding: 20 }}>
          <Text variant="bodyLarge">{`${note.text}`}</Text>
        </View>
      </Card.Content>
    </Card>)
  }

  const renderItemCard = () => {
    if (item instanceof Attendance) {
      return renderAttedace()
    } else if (item instanceof CalenderNote) {
      return renderNote()
    } else {
      return <Text>not found</Text>
    }
  }

  return (
    <Screen style={$root} preset="scroll">
      <View style={{ padding: 10 }}>
        {renderItemCard()}
      </View>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
