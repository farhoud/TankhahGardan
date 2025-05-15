import Realm, { BSON, ObjectSchema } from "realm"

export class Project extends Realm.Object<Project> {
  _id!: BSON.ObjectId
  createAt!: Date
  name!: string
  attendances!: Realm.List<Attendance>
  notes!: Realm.List<CalenderNote>
  description?: string
  deleted?: boolean
  active!: boolean
  static schema: ObjectSchema = {
    name: "Project",
    properties: {
      _id: { type: "objectId", default: () => new Realm.BSON.ObjectID() },
      createdAt: { type: "date", default: () => new Date() },
      name: { type: "string", indexed: true },
      attendances: {
        type: "linkingObjects",
        objectType: "Attendance",
        property: "project",
      },
      notes: {
        type: "linkingObjects",
        objectType: "CalenderNote",
        property: "project",
      },
      description: "string?",
      deleted: "bool?",
      active: {type: "bool", default: true}
    },
    primaryKey: "_id",
  }
}

export class Worker extends Realm.Object<Worker> {
  _id!: BSON.ObjectId
  createAt!: Date
  name!: string
  attendance!: Realm.List<Attendance>
  events!: Realm.List<Event>
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
        type: "linkingObjects",
        objectType: "Attendance",
        property: "worker",
      }
    },
    primaryKey: "_id",
  }
}

export class Attendance extends Realm.Object<Attendance> {
  _id!: BSON.ObjectId
  createAt!: Date
  group?: string
  project!: Project
  from!: Date
  worker!: Worker
  to?: Date
  description?: string
  static schema: ObjectSchema = {
    name: "Attendance",
    properties: {
      _id: { type: "objectId", default: () => new Realm.BSON.ObjectID() },
      createdAt: { type: "date", default: () => new Date() },
      group: "string?",
      project: "Project",
      from: "date",
      to: "date?",
      worker: "Worker",
      description: "string?",
    },
    primaryKey: "_id",
  }
}

export class CalenderNote extends Realm.Object<CalenderNote> {
  _id!: BSON.ObjectId
  createdAt!: Date
  project!: Project
  title!: string
  isDone!: boolean
  dueDate?: Date
  isPinned!: boolean
  text!: string
  at!: Date
  static schema: ObjectSchema = {
    name: "CalenderNote",
    properties: {
      _id: { type: "objectId", default: () => new Realm.BSON.ObjectID() },
      createdAt: { type: "date", default: () => new Date() },
      project: "Project",
      title: "string",
      isDone: { type: "bool", default: false },
      dueDate: "date?",
      isPinned: { type: "bool", default: false },
      text: "string",
      at: "date",
    },
    primaryKey: "_id",
  }
}


