import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { PaymentMethod, PaymentType, ReceiptItem } from "./realm/models"
import { ReceiptItemModel } from "./ReceiptItem"

/**
 * Model description here for TypeScript hints.
 */
export const SpendFormStoreModel = types
  .model("SpendFormStore")
  .props({
    doneAt: types.Date,
    title: types.string,
    group: types.string,
    paymentType: types.enumeration<PaymentType>("PaymentType", ["buy", "transfer"]),
    paymentMethod: types.enumeration<PaymentMethod>("PaymentMethod", [
      "cash",
      "ctc",
      "other",
      "paya",
      "pose",
      "satna",
    ]),
    recipient: types.string,
    accountNum: types.string,
    amount: types.integer,
    transferFee: types.number,
    trackingNum: types.string,
    description: types.maybe(types.string),
    receiptItems: types.map(ReceiptItemModel),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get errors(): Record<string, string> {
      return {}
    },
    get receiptItemsArray() {
      const res = []
      for(const data of self.receiptItems){
        res.unshift(data)
      }
      return res
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    addReceiptItem(item: ReceiptItem) {
      const { title, searchable, defaultPrice } = item
      self.receiptItems.put({ _id: item._id.toHexString(), title, searchable, defaultPrice })
    },
    removeReceiptItem(key:string){
      self.receiptItems.delete(key)
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SpendFormStore extends Instance<typeof SpendFormStoreModel> {}
export interface SpendFormStoreSnapshotOut extends SnapshotOut<typeof SpendFormStoreModel> {}
export interface SpendFormStoreSnapshotIn extends SnapshotIn<typeof SpendFormStoreModel> {}
export const createSpendFormStoreDefaultModel = () =>
  types.optional(SpendFormStoreModel, {
    doneAt: new Date(),
    title: "",
    group: "",
    paymentType: "buy",
    paymentMethod: "cash",
    recipient: "",
    accountNum: "",
    amount: 0,
    transferFee: 0,
    trackingNum: "",
    description: undefined,
    receiptItems: {},
  })
