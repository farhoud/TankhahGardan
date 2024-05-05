import { Instance, SnapshotIn, SnapshotOut, types, unprotect } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const ReceiptItemModel = types
  .model("ReceiptItem")
  .props({
    _id: types.identifier,
    title: types.string,
    amount: types.optional(types.number,0),
    price: types.optional(types.number,0)
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface ReceiptItem extends Instance<typeof ReceiptItemModel> {}
export interface ReceiptItemSnapshotOut extends SnapshotOut<typeof ReceiptItemModel> {}
export interface ReceiptItemSnapshotIn extends SnapshotIn<typeof ReceiptItemModel> {}
export const createReceiptItemDefaultModel = () => types.maybe(ReceiptItemModel)
