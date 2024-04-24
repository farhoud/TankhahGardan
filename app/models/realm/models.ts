import Realm, { BSON, ObjectSchema } from "realm"

export type PaymentMethod = "satna" | "paya" | "cash" | "ctc"
// Define your object model
export class Profile extends Realm.Object<Profile> {
  _id!: BSON.ObjectId
  name!: string
  static schema: ObjectSchema = {
    name: "Profile",
    properties: {
      _id: "objectId",
      name: { type: "string", indexed: "full-text" },
    },
    primaryKey: "_id",
  }
}

export class Fund extends Realm.Object<Fund> {
  _id!: BSON.ObjectId
  doneAt!: Date
  amount!: number
  description?: string
  static schema: ObjectSchema = {
    name: "Fund",
    properties: {
      _id: { type: "objectId", default: new Realm.BSON.ObjectID() },
      doneAt: "date",
      amount: "int",
      description: { type: "string", indexed: true, optional: true },
    },
    primaryKey: "_id",
  }
}

export class Spend extends Realm.Object<Spend> {
  _id!: BSON.ObjectId
  doneAt!: Date
  paymentMethod!: PaymentMethod
  amount!: number
  transferFee!: number
  total!: number
  group!: string
  recipient!: string
  accountNum?: string
  description?: string
  attachments?: string[]
  trackingNum?: string
  static schema: ObjectSchema = {
    name: "Spend",
    properties: {
      _id: { type: "objectId", default: new Realm.BSON.ObjectID() },
      doneAt: "date",
      paymentMethod: { type: "string", indexed: true },
      amount: "int",
      transferFee: { type: "int", default: 0 },
      total: "int",
      recipient: { type: "string", indexed: true },
      accountNum: { type: "string", indexed: true, optional: true },
      group: { type: "string", indexed: true, default: "no_group" },
      description: { type: "string", indexed: true, optional: true },
      attachments: { type: "list", optional: true, objectType: "string" },
      trackingNum: { type: "string", indexed: true, optional: true },
    },
    primaryKey: "_id",
  }
}
