import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { TankhahHomeStoreModel } from "./TankhahHomeStore"
import { CalendarStoreModel } from "./CalendarStore"
import { AuthenticationStoreModel } from "./AuthenticationStore"
import { createSpendFormStoreDefaultModel } from "./SpendFormStore"
import { NoteStoreModel, createNoteStoreDefaultModel } from "./NoteStore"
import { createShareIntentDefaultModel } from "./ShareIntent"

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  tankhahHomeStore: types.optional(TankhahHomeStoreModel, {} as any),
  calendarStore: types.optional(CalendarStoreModel, {} as any),
  authenticationStore: types.optional(AuthenticationStoreModel, {}),
  spendFormStore: createSpendFormStoreDefaultModel(),
  shareIntent: createShareIntentDefaultModel()
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> { }
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> { }
