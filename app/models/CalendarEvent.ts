import { Instance, SnapshotIn, SnapshotOut, cast, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import Realm, { BSON, UpdateMode } from "realm"
import { Alert } from "react-native"
import { Event, Project, Worker } from "./realm/calendar"

/**
 * Model description here for TypeScript hints.
 */
export const CalendarEventModel = types
  .model("CalendarEvent")
  .props({
    _id: types.maybe(types.string),
    title: types.maybe(types.string),
    group: types.maybe(types.string),
    projectId: types.maybe(types.string),
    workerIds: types.array(types.string),
    from: types.optional(types.Date,new Date()),
    to: types.maybe(types.Date),
    description: types.maybe(types.string),
    process: types.maybe(types.string),
    unit: types.maybe(types.string),
    quantity: types.maybe(types.number),
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
    },
    get workerObjIds(){
      return self.workerIds.map(i=>new BSON.ObjectId(i))
    }
  }))
  .actions((self) => ({
    setGroup(text: string) {
      self.group = text
    },
    load(event: Event) {
      self._id = event._id.toHexString()
      self.group = event.group || undefined
      self.title = event.title
      self.projectId = event.project._id.toHexString()
      self.workerIds = cast(event.workers.map(i=>i._id.toHexString()))
      self.from = event.from || undefined
      self.to = event.to || undefined
      self.description = event.description || undefined
      self.process = event.process || undefined
      self.unit = event.unit || undefined
      self.quantity = event.quantity || undefined
    },
    submit(realm: Realm, workers: Worker[], project:Project) {
      self.loading = true
      try {
        const res = realm.write(() => {
          return realm.create(
            Event,
            {
              _id: self._id ? new BSON.ObjectID(self._id) : new BSON.ObjectID(),
              group: self.group,
              project: project,
              title: self.title,
              workers: workers,
              from: self.from,
              to: self.to,
              description: self.description,
              process: self.process,
              unit:self.unit,
              quantity:self.quantity
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
      self.group = undefined
      self.projectId = undefined
      self.title = undefined
      self.workerIds = cast([])
      self.from = new Date()
      self.to = undefined
      self.description = undefined
      self.process = undefined
      self.unit = undefined
      self.quantity = undefined
      self.loading = false
      self.touched = false
    },
    handleTouch: () => {
      self.touched = true
    },
  }))

export interface CalendarEvent extends Instance<typeof CalendarEventModel> {}
export interface CalendarEventSnapshotOut extends SnapshotOut<typeof CalendarEventModel> {}
export interface CalendarEventSnapshotIn extends SnapshotIn<typeof CalendarEventModel> {}
export const createCalendarEventDefaultModel = () => types.optional(CalendarEventModel, {})
