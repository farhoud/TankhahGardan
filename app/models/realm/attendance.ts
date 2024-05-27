import Realm, { BSON, ObjectSchema } from "realm"

export class Worker extends Realm.Object<Worker> {
  _id!: BSON.ObjectId
  createAt!: Date
  name!: string
  attendance!: Realm.List<Attendance>
  skill?: string
  proficiency?: string
  deleted?: boolean
  static schema: ObjectSchema = {
    name: "Worker",
    properties: {
      _id: { type: "objectId", default: () => new Realm.BSON.ObjectID() },
      createdAt: { type: "date", default: () => new Date() },
      name: { type: "string", indexed: true },
      skill: "string?",
      proficiency: "string?",
      deleted: "bool?",
      attendance: {
        type: 'linkingObjects',
        objectType: 'Attendance',
        property: 'worker'
      }
    },
    primaryKey: "_id",
  }
}

export class Attendance extends Realm.Object<Attendance> {
  _id!: BSON.ObjectId
  createAt!: Date
  group!:string
  from!:Date
  worker!: Worker
  to?:Date
  description?: string
  static schema: ObjectSchema = {
    name: "Attendance",
    properties: {
      _id: { type: "objectId", default: () => new Realm.BSON.ObjectID() },
      createdAt: { type: "date", default: () => new Date() },
      group: "string",
      from: "date",
      to: "date?",
      worker: "Worker",
      description: "string?",
    },
    primaryKey: "_id",
  }
}

