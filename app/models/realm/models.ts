import Realm, { BSON, ObjectSchema } from "realm"

export type PaymentMethod = "satna" | "paya" | "cash" | "ctc" | "pos" | "other"
export type AccountNumType = "sheba" | "card" | "other" | "none"
export type PaymentType = "buy" | "transfer"

export const paymentMethodAccountTypeMapper = (method: PaymentMethod|undefined):AccountNumType=>{
  switch  (method){
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

export const realmConfig: Realm.Configuration = {
  schema: [Fund, Spend, ReceiptItem, SpendReceiptItem],
  // Increment the 'schemaVersion', since 'fullName' has replaced
  // 'firstName' and 'lastName' in the schema.
  // The initial schemaVersion is 0.
  schemaVersion: 8,
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
