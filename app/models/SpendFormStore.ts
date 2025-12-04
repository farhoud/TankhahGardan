import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { OperationType, PaymentMethod, TankhahGroup, TankhahItem } from "./realm/tankhah"
import { ReceiptItemModel } from "./ReceiptItem"
import { isNumber } from "app/utils/validation"
import Realm, { BSON, UpdateMode } from "realm"
import { Alert } from "react-native"
import { calcTransferFee } from "app/utils/finance"
import { TxKeyPath, translate } from "app/i18n"
import { formatDateIR } from "app/utils/formatDate"

/**
 * Model description here for TypeScript hints.
 */
export const SpendFormStoreModel = types
  .model("SpendFormStore")
  .props({
    _id: types.maybe(types.string),
    doneAt: types.optional(types.Date, new Date()),
    group: types.optional(types.string, ""),
    opType: types.optional(
      types.enumeration<OperationType>("OperationType", ["buy", "transfer", "fund"]),
      "buy",
    ),
    paymentMethod: types.optional(
      types.enumeration<PaymentMethod>("PaymentMethod", [
        "cash",
        "ctc",
        "other",
        "paya",
        "pos",
        "satna",
        "pol-r",
        "pol-c",
        "pol-d",
        "sts",
      ]),
      "pos",
    ),
    recipient: types.maybe(types.string),
    accountNum: types.maybe(types.string),
    amount: types.optional(types.integer, 0),
    transferFee: types.optional(types.number, 0),
    trackingNum: types.maybe(types.string),
    description: types.maybe(types.string),
    receiptItems: types.map(ReceiptItemModel),
    attachments: types.array(types.string),
    expandedItemKey: types.optional(types.string, ""),
    loading: types.optional(types.boolean, false),
    error: types.maybe(types.string),
    editMode: types.optional(types.boolean, false),
    report: types.maybe(types.string),
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
      if (!self.amount && self.amount > 0) {
        errors.amount = required
      }
      if (!isNumber(self.transferFee)) {
        errors.transferFee = required
      }
      if (!self.paymentMethod) {
        errors.paymentMethod = required
      }
      if (!self.opType) {
        errors.opType = required
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
  }))
  .views((self) => ({
    get isValid() {
      return !!Object.keys(self.errors).length
    },
  }))
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
    async applyFormData(formData: Partial<SpendFormStoreSnapshotIn>) {
      self.setProp("loading", true)
      let report = ""
      try {
        this.reset()
        if (Object.keys(formData).length === 0) {
          return false
        }

        for (const [key, value] of Object.entries(formData)) {
          if (key && value) {
            self.setProp(key as keyof SpendFormStoreSnapshotIn, value)
            const formatedValue = value instanceof Date ? formatDateIR(value) : value
            report = report.concat(
              `${translate(("spend." + key) as TxKeyPath)} با مقدار ${formatedValue} .\n`,
            )
          }
        }
        report += "استخراج شد."
        self.setProp("transferFee", calcTransferFee(self.amount, self.paymentMethod))
        self.setProp("editMode", true)
        self.setProp("report", report)
      } catch (e) {
        if (e instanceof Error) {
          self.setProp("error", e.toString())
        }
      } finally {
        self.setProp("loading", false)
      }
      return !!self.error
    },
    reset() {
      self._id = undefined
      self.accountNum = undefined
      self.doneAt = new Date()
      self.paymentMethod = "pos"
      self.amount = 0
      self.transferFee = 0
      self.recipient = ""
      self.group = ""
      self.description = undefined
      self.attachments.clear()
      self.trackingNum = undefined
      self.opType = "buy"
      self.receiptItems.clear()
      self.editMode = false
      self.report = undefined
    },
    setSpend(item: TankhahItem) {
      self._id = item._id.toHexString()
      self.doneAt = item.doneAt
      self.paymentMethod = item.paymentMethod
      self.amount = item.amount
      self.transferFee = item.transferFee
      self.recipient = item.recipient
      self.accountNum = item.accountNum || undefined
      self.group = item.group?.name || ""
      self.description = item.description || undefined
      self.attachments.replace(item.attachments?.slice() || [])
      self.trackingNum = item.trackingNum || undefined
      self.opType = item.opType as OperationType
      self.receiptItems.clear()
      item.receiptItems?.forEach((i) => {
        self.receiptItems.put({ _id: new BSON.ObjectID().toHexString(), ...i })
      })
      self.editMode = true
    },
    submit(realm: Realm) {
      self.loading = true
      let groupObject: TankhahGroup | undefined
      const {
        doneAt,
        paymentMethod,
        opType,
        amount,
        transferFee,
        recipient,
        accountNum,
        group,
        description,
        attachments,
        trackingNum,
        receiptItemsArray,
      } = self
      const receiptItems = receiptItemsArray.map(([_, i]) => ({
        price: i.price,
        amount: i.amount,
        title: i.title,
      }))

      const groups = realm.objects(TankhahGroup).filtered("name = $0", group)
      if (groups.length === 0) {
        groupObject = realm.create(TankhahGroup, {
          _id: new BSON.ObjectID(),
          name: group,
        })
      } else {
        groupObject = groups[0]
      }

      try {
        const res = realm.write(() => {
          return realm.create(
            "TankhahItem",
            {
              _id: self._id ? new BSON.ObjectID(self._id) : new BSON.ObjectID(),
              doneAt,
              paymentMethod,
              amount,
              transferFee,
              total: amount + transferFee,
              recipient,
              accountNum,
              group: groupObject,
              description,
              attachments,
              trackingNum,
              opType,
              receiptItems,
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
  }))

export interface SpendFormStore extends Instance<typeof SpendFormStoreModel> {}
export interface SpendFormStoreSnapshotOut extends SnapshotOut<typeof SpendFormStoreModel> {}
export interface SpendFormStoreSnapshotIn extends SnapshotIn<typeof SpendFormStoreModel> {}
export const createSpendFormStoreDefaultModel = () =>
  types.optional(SpendFormStoreModel, {
    doneAt: new Date(),
    group: "",
    opType: "buy",
    paymentMethod: "pos",
    recipient: "",
    accountNum: "",
    amount: 0,
    transferFee: 0,
    trackingNum: "",
    receiptItems: {},
  })
