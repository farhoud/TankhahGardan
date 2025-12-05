import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { CalendarAttendanceModel } from "./CalendarAttendance"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { Attendance, CalenderNote } from "./realm/calendar"
import { CalendarNoteModel } from "./CalendarNote"
import { CalendarSearchModel } from "./CalendarSearch"

/**
 * Model description here for TypeScript hints.
 */
export const CalendarStoreModel = types
  .model("CalendarStore")
  .props({
    search: types.optional(CalendarSearchModel, {}),
    attendanceForm: types.optional(CalendarAttendanceModel, {}),
    noteForm: types.optional(CalendarNoteModel, {}),
    currentForm: types.optional(types.enumeration(["note", "attendance"]), "attendance"),
    selecting: types.optional(types.boolean, false),
    currentDate: types.optional(types.Date, () => new Date()),
    currentProjectId: types.maybe(types.string),
    selectedWorkerObjIds: types.optional(types.array(types.string), []),
    currentView: types.optional(
      types.enumeration(["note", "attendance", "all"]),
      "all",
    ),
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    clear() {
      self.attendanceForm.clear({ date: self.currentDate, projectId: self.currentProjectId })
      self.noteForm.clear({ date: self.currentDate, projectId: self.currentProjectId })
      self.selecting = false
    },
    load(item: Attendance | CalenderNote) {
      if (item instanceof Attendance) {
        self.attendanceForm.load(item)
        self.setProp("currentForm", "attendance")
      }
      if (item instanceof CalenderNote) {
        self.noteForm.load(item)
        self.setProp("currentForm", "note")
      }

    },
    setGroup(group: string) {
      self.attendanceForm.setGroup(group)
      self.noteForm.setGroup(group)
    },
    selectProjectId(projectId: string) {
      self.currentProjectId = projectId
      self.attendanceForm.setProp("projectId", projectId)
      self.noteForm.setProp("projectId", projectId)
    },
    selectWorker(workerId: string) {
      switch (self.currentForm) {
        case "attendance":
          self.attendanceForm.setProp("workerId", workerId)
          
      }
    },
    deSelectWorker(workerId: string) {
      switch (self.currentForm) {
        case "attendance":
          self.attendanceForm.setProp("workerId", undefined)
          
      }
    },
  }))
  .views((self) => ({}))

export interface CalendarStore extends Instance<typeof CalendarStoreModel> { }
export interface CalendarStoreSnapshotOut extends SnapshotOut<typeof CalendarStoreModel> { }
export interface CalendarStoreSnapshotIn extends SnapshotIn<typeof CalendarStoreModel> { }
export const createCalendarStoreDefaultModel = () => types.optional(CalendarStoreModel, {})
