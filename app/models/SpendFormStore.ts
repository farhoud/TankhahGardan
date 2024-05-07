import { Instance, SnapshotIn, SnapshotOut, types, unprotect } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { PaymentMethod, PaymentType, ReceiptItem, Spend } from "./realm/models"
import { ReceiptItemModel } from "./ReceiptItem"
import { isNumber } from "app/utils/validation"
import Realm, { BSON, Unmanaged, UpdateMode } from "realm"
import { Alert } from "react-native"
import { parseText } from "app/utils/textParser"

/**
 * Model description here for TypeScript hints.
 */
export const SpendFormStoreModel = types
  .model("SpendFormStore")
  .props({
    _id: types.maybe(types.string),
    doneAt: types.Date,
    title: types.maybe(types.string),
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
    accountNum: types.maybe(types.string),
    amount: types.integer,
    transferFee: types.number,
    trackingNum: types.maybe(types.string),
    description: types.maybe(types.string),
    receiptItems: types.map(ReceiptItemModel),
    attachments: types.array(types.string),
    expandedItemKey: types.optional(types.string, ""),
    loading: types.optional(types.boolean, false),
    error: types.maybe(types.string),
    editMode: types.optional(types.boolean, false)
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get receiptItemsArray() {
      const res = []
      for (const data of self.receiptItems) {
        res.unshift(data)
      }
      return res
    },
    itemByKeys(key: string) {
      return self.receiptItems.get(key)
    },
    get errors(): Record<string, string> {
      let errors: Record<string, string> = {}
      const required = "این فیلد الزامیست"
      if (!self.doneAt) {
        errors.doneAt = required
      }
      if (!self.recipient) {
        errors.recipient = required
      }
      if (!self.amount && self.amount > 0) {
        errors.amount = required
      }
      if (!isNumber(self.transferFee)) {
        errors.transferFee = required
      }
      if (!self.paymentMethod) {
        errors.paymentMethod = required
      }
      if (!self.paymentType) {
        errors.paymentType = required
      }
      if (!self.group) {
        errors.group = required
      }
      return errors
    },
    get totalItems() {
      let total = 0
      self.receiptItems.forEach((i) => (total += i.price * i.amount))
      return total
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .views((self) => ({
    get isValid() {
      return !!Object.keys(self.errors).length
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    addReceiptItem(item: { title: string; _id: string; price: number }) {
      const { title, price, _id } = item
      self.receiptItems.put({
        _id,
        title,
        price,
        amount: 1,
      })
      this.expand(item._id)
    },
    removeReceiptItem(key: string) {
      self.receiptItems.delete(key)
    },
    expand(key: string) {
      if (self.expandedItemKey === key) self.expandedItemKey = ""
      else self.expandedItemKey = key
    },
    applyShareText(text: string) {
      const res = parseText(text)
      this.reset()
      if (Object.keys(res).length === 0) {
        return false
      }
      console.log(res)
      for (const [key, value] of Object.entries(res)) {
        if (key && value) self.setProp(key as keyof SpendFormStoreSnapshotIn, value)
      }
      self.editMode = true
      return true
    },
    reset() {
      self._id = undefined
      self.accountNum = undefined
      self.doneAt = new Date()
      self.paymentMethod = "cash"
      self.amount = 0
      self.transferFee = 0
      self.recipient = ""
      self.accountNum = undefined
      self.group = ""
      self.description = undefined
      self.attachments.clear()
      self.trackingNum = undefined
      self.paymentType = "buy"
      self.title = undefined
      self.receiptItems.clear()
      self.editMode = false
    },
    setSpend(item: Spend) {
      self._id = item._id.toHexString()
      self.doneAt = item.doneAt
      self.paymentMethod = item.paymentMethod
      self.amount = item.amount
      self.transferFee = item.transferFee
      self.recipient = item.recipient
      self.accountNum = item.accountNum || undefined
      self.group = item.group
      self.description = item.description || undefined
      self.attachments.replace(item.attachments?.slice() || [])
      self.trackingNum = item.trackingNum || undefined
      self.paymentType = item.paymentType as PaymentType
      self.title = item.title || undefined
      self.receiptItems.clear()
      item.receiptItems?.forEach((i) => {
        self.receiptItems.put({ _id: new BSON.ObjectID().toHexString(), ...i })
      })
      self.editMode = true
    },
    submit(realm: Realm) {
      self.loading = true
      const {
        doneAt,
        paymentMethod,
        paymentType,
        amount,
        transferFee,
        recipient,
        accountNum,
        group,
        description,
        attachments,
        trackingNum,
        title,
        receiptItemsArray,
      } = self
      const receiptItems = receiptItemsArray.map(([_, i]) => ({
        price: i.price,
        amount: i.amount,
        title: i.title,
      }))

      console.log({
        _id: self._id ? self._id : new BSON.ObjectID(),
        doneAt,
        paymentMethod,
        amount,
        transferFee,
        total: amount + transferFee,
        recipient,
        accountNum,
        group,
        description,
        attachments,
        trackingNum,
        paymentType,
        title,
        receiptItems,
      })
      try {
        const res = realm.write(() => {
          return realm.create(
            "Spend",
            {
              _id: self._id ? new BSON.ObjectID(self._id) : new BSON.ObjectID(),
              doneAt,
              paymentMethod,
              amount,
              transferFee,
              total: amount + transferFee,
              recipient,
              accountNum,
              group,
              description,
              attachments,
              trackingNum,
              paymentType,
              title: title || undefined,
              receiptItems,
            },
            self._id ? UpdateMode.Modified : undefined,
          )
        })
        self.loading = false
        return res
      } catch (e: any) {
        // self.error = e.toString()
        Alert.alert("store problem", e.toString())
        self.loading = false
        return undefined
      }
    },
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
    receiptItems: {},
  })
