import { Instance, SnapshotIn, SnapshotOut, cast, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { createFormFieldDefaultModel } from "./FormField"
import { BSON,Realm, UpdateMode } from "realm"
import { Project, Task, Worker } from "./realm/calendar"
import { Alert } from "react-native"

/**
 * Model description here for TypeScript hints.
 */
export const CalendarTaskModel = types
  .model("CalendarTask")
  .props({
    _id: types.maybe(types.string),
    title: createFormFieldDefaultModel("title"),
    projectId: types.maybe(types.string),
    workerIds: types.array(types.string),
    isDone: types.optional(types.boolean, false),
    dueDate: types.maybe(types.Date),
    description: types.maybe(types.string),
    loading: types.optional(types.boolean, false),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get isValid() {
      for(const item of Object.values(self)){
        if(item && item instanceof Object && item.error){
          return false
        }
      }
      return true
    },
    get workerObjIds(){
      return self.workerIds.map(i=>new BSON.ObjectId(i))
    }
  }))
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({

    load(task: Task) {
      self._id = task._id.toHexString()
      self.title.value = task.title
      self.projectId = task.project ? task.project._id.toHexString() : undefined
      self.workerIds = cast(task.workers.map(i=>i._id.toHexString()))
      self.isDone = task.isDone
      self.dueDate = task.dueDate || undefined
      self.description = task.description || undefined
    },
    submit(realm: Realm, workers: Worker[], project:Project|undefined) {
      self.loading = true
      try {
        const res = realm.write(() => {
          return realm.create(
            Task,
            {
              _id: self._id ? new BSON.ObjectID(self._id) : new BSON.ObjectID(),
              project: project,
              title: self.title.value as string,
              isDone: self.isDone,
              workers: workers,
              dueDate: self.dueDate,
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
    clear: (defaultValues?: { date?: Date, projectId?: string }) => {
      self._id = undefined
      self.projectId = defaultValues?.projectId || undefined
      self.title.clear()
      self.isDone = false
      self.workerIds = cast([])
      self.dueDate = undefined
      self.description = undefined
      self.loading = false
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface CalendarTask extends Instance<typeof CalendarTaskModel> {}
export interface CalendarTaskSnapshotOut extends SnapshotOut<typeof CalendarTaskModel> {}
export interface CalendarTaskSnapshotIn extends SnapshotIn<typeof CalendarTaskModel> {}
export const createCalendarTaskDefaultModel = () => types.optional(CalendarTaskModel, {})
