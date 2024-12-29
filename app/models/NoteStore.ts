import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { NoteFormModel } from "./forms/NoteForm";
import { withSetPropAction } from "./helpers/withSetPropAction";


export const NoteStoreModel = types
  .model("NoteStore")
  .props({
    currentProjectId: types.maybe(types.string),
    currentDate: types.optional(types.Date, () => new Date()),
    form: types.optional(NoteFormModel, {}),
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    clear() {
      self.form.reset()
    },
  }))


export interface NoteStore extends Instance<typeof NoteStoreModel> { }
export interface NoteStoreSnapshotOut extends SnapshotOut<typeof NoteStoreModel> { }
export interface NoteStoreSnapshotIn extends SnapshotIn<typeof NoteStoreModel> { }
export const createNoteStoreDefaultModel = () => types.optional(NoteStoreModel, {})
