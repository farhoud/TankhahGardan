import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import Realm, { BSON, UpdateMode } from "realm"
import { Alert } from "react-native"
import { Attendance, Project, Worker } from "./realm/calendar"

const defaultStartTime = (_date?: Date) => {
  const date = !!_date ? new Date(_date) : new Date()
  date.setHours(8)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)
  return date
}

const defaultEndTime = (_date?: Date) => {
  const date = !!_date ? new Date(_date) : new Date()
  date.setHours(17)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)
  return date
}

/**
 * Model description here for TypeScript hints.
 */
export const CalendarAttendanceModel = types
  .model("CalendarAttendance")
  .props({
    _id: types.maybe(types.string),
    from: types.optional(types.Date, defaultStartTime),
    to: types.maybe(types.optional(types.Date, defaultEndTime)),
    group: types.maybe(types.string),
    projectId: types.maybe(types.string),
    description: types.maybe(types.string),
    workerId: types.maybe(types.string),
    loading: types.optional(types.boolean, false),
    touched: types.optional(types.boolean, false),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get errors(): Record<string, string> {
      if (!self.touched) {
        return {}
      }
      let errors: Record<string, string> = {}
      const required = "این فیلد الزامیست"
      if (!self.from) {
        errors.from = required
      }
      return errors
    },
  }))
  .views((self) => ({
    get isValid() {
      return !!Object.keys(self.errors).length
    }
  }))
  .actions((self) => ({
    setGroup(text: string) {
      self.group = text
    },
    load(attendance: Attendance) {
      self.workerId = attendance.worker._id.toHexString()
      self.from = attendance.from
      self.to = attendance.to || undefined
      self.description = attendance.description || undefined
      self.group = attendance.group
      self.projectId = attendance.project._id.toHexString()
      self._id = attendance._id.toHexString()
    },
    submit(realm: Realm, worker: Worker, project: Project) {
      self.loading = true
      try {
        const res = realm.write(() => {
          return realm.create(
            Attendance,
            {
              _id: self._id ? new BSON.ObjectID(self._id) : new BSON.ObjectID(),
              worker: worker,
              group: self.group,
              project: project,
              from: self.from,
              to: self.to,
              description: self.description,
            },
            self._id ? UpdateMode.Modified : undefined,
          )
        })
        self.loading = false

        return res
      } catch (e: any) {
        // self.error = e.toString()
        Alert.alert("save failed", e.toString())
        self.loading = false
        return undefined
      }
    },
    clear: (date?: Date) => {
      self._id = undefined
      self.from = defaultStartTime(date)
      self.to = defaultEndTime(date)
      self.description = undefined
      self.group = undefined
      self.projectId = undefined
      self.workerId = undefined
      self.loading = false
      self.touched = false
    },
    handleTouch: () => {
      self.touched = true
    },
  }))

export interface CalendarAttendance extends Instance<typeof CalendarAttendanceModel> {}
export interface CalendarAttendanceSnapshotOut
  extends SnapshotOut<typeof CalendarAttendanceModel> {}
export interface CalendarAttendanceSnapshotIn extends SnapshotIn<typeof CalendarAttendanceModel> {}
export const createCalendarAttendanceDefaultModel = () =>
  types.optional(CalendarAttendanceModel, {})
