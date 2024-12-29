import { FC } from "react"
import { View } from "react-native"
import { AttendanceForm } from "./AttendanceForm"
import { Chip } from "react-native-paper"
import { $row, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { EventForm } from "./EventForm"
import { Attendance, Event, Task } from "app/models/realm/calendar"
import { TaskForm } from "./TaskForm"

export interface CalendarFormProps {
  onDone: (value: Event | Attendance | Task) => void
}
type TabKey = undefined | "task" | "event" | "attendance"
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
          selected={isSelected("task")}
          onPress={() => {
            setProp("currentForm", "task")
          }}
        >
          تسک
        </Chip>
        <Chip
          showSelectedOverlay
          shouldRasterizeIOS
          showSelectedCheck={false}
          selected={isSelected("event")}
          onPress={() => {
            setProp("currentForm", "event")
          }}
        >
          رخداد
        </Chip>
      </View>
      {isSelected("attendance") && <AttendanceForm onDone={(value) => props.onDone(value)} />}
      {isSelected("event") && <EventForm onDone={(value) => props.onDone(value)} />}
      {isSelected("task") && <TaskForm onDone={(value) => props.onDone(value)} />}
    </View>
  )
})
