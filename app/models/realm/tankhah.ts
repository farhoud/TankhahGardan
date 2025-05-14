import Realm, { BSON, ObjectSchema } from "realm"

export type PaymentMethod = "satna" | "paya" | "cash" | "ctc" | "pos" | "other" | "sts" | "pol-r" | "pol-c" | "pol-d"
export type AccountNumType = "sheba" | "card" | "other" | "none" | "sepordeh"
export type PaymentType = "buy" | "transfer"
export type OperationType = "buy" | "transfer" | "fund"

export const paymentMethodAccountTypeMapper = (
  method: PaymentMethod | undefined,
): AccountNumType => {
  switch (method) {
    case "satna":
      return "sheba"
    case "paya":
      return "sheba"
    case "cash":
      return "none"
    case "ctc":
      return "card"
    case "pos":
      return "none"
    case "other":
      return "other"
    case "pol-r":
      return "sheba"
    case "pol-c":
      return "sheba"
    case "pol-d":
      return "sheba"
    case "sts":
      return "sepordeh"
    default:
      return "other"
  }
}

export class Fund extends Realm.Object<Fund> {
  _id!: BSON.ObjectId
  createAt!: Date
  doneAt!: Date
  amount!: number
  description?: string
  static schema: ObjectSchema = {
    name: "Fund",
    properties: {
      _id: { type: "objectId", default: () => new Realm.BSON.ObjectID() },
      createdAt: { type: "date", default: () => new Date() },
      doneAt: "date",
      amount: "int",
      description: { type: "string", indexed: true, optional: true },
    },
    primaryKey: "_id",
  }
}

export class Spend extends Realm.Object<Spend> {
  _id!: BSON.ObjectId
  createAt!: Date
  doneAt!: Date
  paymentMethod!: PaymentMethod
  paymentType!: PaymentType
  amount!: number
  transferFee!: number
  total!: number
  group!: string
  recipient?: string
  accountNum?: string
  description?: string
  attachments?: string[]
  trackingNum?: string
  receiptItems?: Realm.List<SpendReceiptItem>
  static schema: ObjectSchema = {
    name: "Spend",
    properties: {
      _id: { type: "objectId", default: () => new BSON.ObjectID() },
      createdAt: { type: "date", default: () => new Date() },
      doneAt: "date",
      paymentMethod: { type: "string", indexed: true },
      paymentType: { type: "string", indexed: true },
      amount: "int",
      transferFee: { type: "int", default: 0 },
      total: "int",
      recipient: { type: "string", indexed: true, optional: true },
      accountNum: { type: "string", indexed: true, optional: true },
      group: { type: "string", indexed: true, default: "no_group" },
      description: { type: "string", indexed: true, optional: true },
      attachments: { type: "list", optional: true, objectType: "string" },
      trackingNum: { type: "string", indexed: true, optional: true },
      receiptItems: "SpendReceiptItem[]",
    },
    primaryKey: "_id",
  }
}

export class TankhahItem extends Realm.Object<TankhahItem> {
  _id!: BSON.ObjectId
  createAt!: Date
  doneAt!: Date
  paymentMethod!: PaymentMethod
  opType!: OperationType
  amount!: number
  transferFee!: number
  total!: number
  group!: string
  recipient?: string
  accountNum?: string
  description?: string
  attachments?: string[]
  trackingNum?: string
  receiptItems?: Realm.List<TankhahReceiptItem>
  static schema: ObjectSchema = {
    name: "TankhahItem",
    properties: {
      _id: { type: "objectId", default: () => new BSON.ObjectID() },
      createdAt: { type: "date", default: () => new Date() },
      doneAt: "date",
      paymentMethod: { type: "string", indexed: true },
      opType: { type: "string", indexed: true },
      amount: "int",
      transferFee: { type: "int", default: 0 },
      total: "int",
      recipient: { type: "string", indexed: true, optional: true },
      accountNum: { type: "string", indexed: true, optional: true },
      group: { type: "string", indexed: true, default: "no_group" },
      description: { type: "string", indexed: true, optional: true },
      attachments: { type: "list", optional: true, objectType: "string" },
      trackingNum: { type: "string", indexed: true, optional: true },
      receiptItems: "SpendReceiptItem[]",
    },
    primaryKey: "_id",
  }
}

export class TankhahReceiptItem extends Realm.Object<TankhahReceiptItem> {
  createAt!: Date
  title!: string
  price?: number
  amount?: number
  static schema: ObjectSchema = {
    name: "TankhahReceiptItem",
    embedded: true,
    properties: {
      createdAt: { type: "date", default: () => new Date() },
      title: { type: "string" },
      amount: { type: "int", optional: true },
      price: { type: "float", optional: true },
    },
  }
}

export class ReceiptItem extends Realm.Object<ReceiptItem> {
  _id!: BSON.ObjectId
  createAt!: Date
  usage!: number
  title!: string
  searchable!: boolean
  defaultPrice?: number
  description?: string
  static schema: ObjectSchema = {
    name: "ReceiptItem",
    properties: {
      _id: { type: "objectId", default: () => new Realm.BSON.ObjectID() },
      createdAt: { type: "date", default: () => new Date() },
      usage: { type: "int", default: 0 },
      title: { type: "string", indexed: true },
      searchable: { type: "bool", indexed: true },
      description: { type: "string", indexed: true, optional: true },
      defaultPrice: { type: "float", optional: true },
    },
    primaryKey: "_id",
  }
}

export class SpendReceiptItem extends Realm.Object<SpendReceiptItem> {
  createAt!: Date
  title!: string
  price?: number
  amount?: number
  static schema: ObjectSchema = {
    name: "SpendReceiptItem",
    embedded: true,
    properties: {
      createdAt: { type: "date", default: () => new Date() },
      title: { type: "string" },
      amount: { type: "int", optional: true },
      price: { type: "float", optional: true },
    },
  }
}