import { createRealmContext } from "@realm/react"
import Realm, { BSON, ObjectSchema } from "realm"

export type PaymentMethod = "satna" | "paya" | "cash" | "ctc" | "pose" | "other"
export type PaymentType = "buy" | "transfer"
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

export class ReceiptItem extends Realm.Object<ReceiptItem> {
  _id!: BSON.ObjectId
  title!: string
  searchable!: boolean
  defaultPrice?: number
  description?: string
  static schema: ObjectSchema = {
    name: "ReceiptItem",
    properties: {
      _id: { type: "objectId", default: () => new Realm.BSON.ObjectID() },
      title: { type: "string", indexed: true },
      searchable: { type: "bool", indexed: true },
      description: { type: "string", indexed: true, optional: true },
      defaultPrice: { type: "float", optional: true },
    },
    primaryKey: "_id",
  }
}

export const realmConfig: Realm.Configuration = {
  schema: [Fund, Spend, ReceiptItem],
  // Increment the 'schemaVersion', since 'fullName' has replaced
  // 'firstName' and 'lastName' in the schema.
  // The initial schemaVersion is 0.
  schemaVersion: 2,
  // onMigration: (oldRealm: Realm, newRealm: Realm) => {
  //   // only apply this change if upgrading schemaVersion
  //   if (oldRealm.schemaVersion < 1) {
  //     const oldObjects: Realm.Results<OldObjectModel> =
  //       oldRealm.objects(OldObjectModel);
  //     const newObjects: Realm.Results<Person> = newRealm.objects(Person);
  //     // loop through all objects and set the fullName property in the
  //     // new schema
  //     for (const objectIndex in oldObjects) {
  //       const oldObject = oldObjects[objectIndex];
  //       const newObject = newObjects[objectIndex];
  //       newObject.fullName = `${oldObject.firstName} ${oldObject.lastName}`;
  //     }
  //   }
  // },
}
