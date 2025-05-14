import { FC } from "react"
import { View } from "react-native"
import { AttendanceForm } from "./AttendanceForm"
import { Chip } from "react-native-paper"
import { $row, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { CalenderNoteForm } from "./CalenderNoteForm"
import { Attendance, CalenderNote} from "app/models/realm/calendar"

export interface CalendarFormProps {
  onDone: (value: CalenderNote | Attendance) => void
}
type TabKey = undefined | "note" | "attendance"
export const CalendarForm: FC<CalendarFormProps> = observer((props) => {
  const {
    calendarStore: { currentForm, setProp },
  } = useStores()
  const isSelected = (key: TabKey) => {
    return currentForm === key
  }
  return (
    <View>
      <View
        style={[
          $row,
          { justifyContent: "space-around", marginBottom: spacing.sm, paddingHorizontal: "10%" },
        ]}
      >
        <Chip
          showSelectedOverlay
          shouldRasterizeIOS
          showSelectedCheck={false}
          selected={isSelected("attendance")}
          onPress={() => {
            setProp("currentForm", "attendance")
          }}
        >
          حضور
        </Chip>
        <Chip
          showSelectedOverlay
          shouldRasterizeIOS
          showSelectedCheck={false}
          selected={isSelected("note")}
          onPress={() => {
            setProp("currentForm", "note")
          }}
        >
          یاداشت
        </Chip>
      </View>
      {isSelected("attendance") && <AttendanceForm onDone={(value) => props.onDone(value)} />}
      {isSelected("note") && <CalenderNoteForm onDone={(value) => props.onDone(value)} />}
    </View>
  )
})
