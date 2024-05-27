import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { AttendanceFormStoreModel } from "./AttendanceFormStore"
import { AuthenticationStoreModel } from "./AuthenticationStore"
import { createSpendFormStoreDefaultModel } from "./SpendFormStore" 

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  attendanceFormStore: types.optional(AttendanceFormStoreModel, {} as any),
  authenticationStore: types.optional(AuthenticationStoreModel, {}),
  spendFormStore: createSpendFormStoreDefaultModel(),
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
