import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { createFormFieldDefaultModel } from "./FormField"
import { BSON,Realm, UpdateMode } from "realm"
import { Project, CalenderNote } from "./realm/calendar"
import { Alert } from "react-native"

/**
 * Model description here for TypeScript hints.
 */
export const CalendarNoteModel = types
  .model("CalendarNote")
  .props({
    _id: types.maybe(types.string),
    title: createFormFieldDefaultModel("title"),
    projectId: types.maybe(types.string),
    group: types.maybe(types.string),
    isDone: types.optional(types.boolean, false),
    dueDate: types.maybe(types.Date),
    text: types.maybe(types.string),
    loading: types.optional(types.boolean, false),
    isPinned: types.optional(types.boolean, false),
    at: types.optional(types.Date, new Date()),
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
    }
  }))
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setGroup(text: string) {
      self.group = text
    },
    load(note: CalenderNote) {
      self._id = note._id.toHexString()
      self.title.value = note.title
      self.projectId = note.project ? note.project._id.toHexString() : undefined
      self.isDone = note.isDone
      self.dueDate = note.dueDate || undefined
      self.text = note.text
      self.isPinned == note.isPinned
      self.at = note.at
    },
    submit(realm: Realm, project:Project|undefined) {
      self.loading = true
      try {
        const res = realm.write(() => {
          return realm.create(
            CalenderNote,
            {
              _id: self._id ? new BSON.ObjectID(self._id) : new BSON.ObjectID(),
              project: project,
              title: self.title.value as string,
              isDone: self.isDone,
              dueDate: self.dueDate,
              text: self.text,
              isPinned: self.isPinned,
              at: self.at,
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
      self.at = defaultValues?.date || new Date()
      self.title.clear()
      self.isDone = false
      self.dueDate = undefined
      self.text = undefined
      self.loading = false
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface CalendarNote extends Instance<typeof CalendarNoteModel> {}
export interface CalendarNoteSnapshotOut extends SnapshotOut<typeof CalendarNoteModel> {}
export interface CalendarNoteSnapshotIn extends SnapshotIn<typeof CalendarNoteModel> {}
export const createCalendarNoteDefaultModel = () => types.optional(CalendarNoteModel, {})
