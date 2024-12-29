import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { CalendarAttendanceModel } from "./CalendarAttendance"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { CalendarEventModel } from "./CalendarEvent"
import { Attendance, Event, Task } from "./realm/calendar"
import { CalendarTaskModel } from "./CalendarTask"

/**
 * Model description here for TypeScript hints.
 */
export const CalendarStoreModel = types
  .model("CalendarStore")
  .props({
    attendanceForm: types.optional(CalendarAttendanceModel, {}),
    eventForm: types.optional(CalendarEventModel, {}),
    taskForm: types.optional(CalendarTaskModel, {}),
    currentForm: types.optional(types.enumeration(["event", "attendance", "task"]), "attendance"),
    selecting: types.optional(types.boolean, false),
    currentDate: types.optional(types.Date, () => new Date()),
    currentProjectId: types.maybe(types.string),
    currentView: types.optional(
      types.enumeration(["event", "attendance", "attendance", "task", "all"]),
      "all",
    ),
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    clear() {
      self.attendanceForm.clear({ date: self.currentDate, projectId: self.currentProjectId })
      self.eventForm.clear({ date: self.currentDate, projectId: self.currentProjectId })
      self.taskForm.clear()
      self.selecting = false
    },
    load(item: Attendance | Event | Task) {
      if (item instanceof Attendance) {
        self.attendanceForm.load(item)
        self.setProp("currentForm", "attendance")
      }
      if (item instanceof Event) {
        self.eventForm.load(item)
        self.setProp("currentForm", "event")
      }
      if (item instanceof Task) {
        self.taskForm.load(item)
        self.setProp("currentForm", "event")
      }
    },
    setGroup(group: string) {
      self.attendanceForm.setGroup(group)
      self.eventForm.setGroup(group)
    },
    selectProjectId(projectId: string) {
      self.currentProjectId = projectId
      self.attendanceForm.setProp("projectId", projectId)
      self.eventForm.setProp("projectId", projectId)
    },
    selectWorker(workerId: string) {
      switch (self.currentForm) {
        case "attendance":
          self.attendanceForm.setProp("workerId", workerId)
          return
        case "event":
          self.eventForm.setProp("workerIds", [...self.eventForm.workerIds, workerId])
          return
        case "task":
          self.taskForm.setProp("workerIds", [...self.taskForm.workerIds, workerId])
          return
      }
    },
    deSelectWorker(workerId: string) {
      switch (self.currentForm) {
        case "attendance":
          self.attendanceForm.setProp("workerId", undefined)
          return
        case "event":
          self.eventForm.setProp(
            "workerIds",
            self.eventForm.workerIds.filter((i) => i !== workerId),
          )
          return
        case "task":
          self.eventForm.setProp(
            "workerIds",
            self.taskForm.workerIds.filter((i) => i !== workerId),
          )
          return
      }
    },
  }))
  .views((self) => ({
    get selectedWorkerObjIds() {
      if (self.currentForm === "event") {
        return self.eventForm.workerObjIds
      }
      if (self.currentForm === "task") {
        return self.taskForm.workerObjIds
      }
      return []
    },
  }))

export interface CalendarStore extends Instance<typeof CalendarStoreModel> { }
export interface CalendarStoreSnapshotOut extends SnapshotOut<typeof CalendarStoreModel> { }
export interface CalendarStoreSnapshotIn extends SnapshotIn<typeof CalendarStoreModel> { }
export const createCalendarStoreDefaultModel = () => types.optional(CalendarStoreModel, {})
