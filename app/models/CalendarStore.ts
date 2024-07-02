import { Instance, SnapshotIn, SnapshotOut, cast, types } from "mobx-state-tree"
import { CalendarAttendanceModel } from "./CalendarAttendance"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { CalendarEventModel } from "./CalendarEvent"
import { Attendance, Event } from "./realm/calendar"

/**
 * Model description here for TypeScript hints.
 */
export const CalendarStoreModel = types
  .model("CalendarStore")
  .props({
    attendanceForm: types.optional(CalendarAttendanceModel, {}),
    eventForm: types.optional(CalendarEventModel, {}),
    currentForm: types.optional(types.enumeration(["event", "attendance"]), "attendance"),
    selecting: types.optional(types.boolean, false),
    currentDate: types.optional(types.Date, new Date()),
    currentProjectId: types.maybe(types.string)
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    clear() {
      self.attendanceForm.clear(self.currentDate)
      self.eventForm.clear()
      self.selecting = false
    },
    load(item: Attendance | Event) {
      item instanceof Attendance && self.attendanceForm.load(item)
      item instanceof Event && self.eventForm.load(item)
    },
    setGroup(group: string) {
      self.attendanceForm.setGroup(group)
      self.eventForm.setGroup(group)
    },
    selectProjectId(projectId: string) {
      self.currentProjectId = projectId
      self.attendanceForm.setProp("projectId",projectId)
      self.eventForm.setProp("projectId",projectId)
    },
    selectWorker(workerId: string) {
      switch (self.currentForm) {
        case "attendance":
          self.attendanceForm.setProp("workerId", workerId)
          return
        case "event":
          self.eventForm.setProp("workerIds", [...self.eventForm.workerIds, workerId])
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
      }
    },
  })).views((self)=>({
    get selectedWorkerObjIds (){
      if(self.currentForm==="event"){
        return self.eventForm.workerObjIds
      }
      return []
    }
  }))

export interface CalendarStore extends Instance<typeof CalendarStoreModel> {}
export interface CalendarStoreSnapshotOut extends SnapshotOut<typeof CalendarStoreModel> {}
export interface CalendarStoreSnapshotIn extends SnapshotIn<typeof CalendarStoreModel> {}
export const createCalendarStoreDefaultModel = () => types.optional(CalendarStoreModel, {})
