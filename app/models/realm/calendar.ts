import Realm, { BSON, ObjectSchema } from "realm"

export class Project extends Realm.Object<Project> {
  _id!: BSON.ObjectId
  createAt!: Date
  name!: string
  attendances!: Realm.List<Attendance>
  events!: Realm.List<Event>
  description?: string
  deleted?: boolean
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
      events: {
        type: "linkingObjects",
        objectType: "Event",
        property: "project",
      },
      description: "string?",
      deleted: "bool?"
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
      },
      events: {
        type: "linkingObjects",
        objectType: "Event",
        property: "workers",
      },
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

export class Event extends Realm.Object<Event> {
  _id!: BSON.ObjectId
  createAt!: Date
  group?: string
  project!: Project
  title!: string
  workers!: Realm.List<Worker>
  from!: Date
  to?: Date
  description?: string
  process?: string
  unit?: string
  quantity?: number
  static schema: ObjectSchema = {
    name: "Event",
    properties: {
      _id: { type: "objectId", default: () => new Realm.BSON.ObjectID() },
      createdAt: { type: "date", default: () => new Date() },
      group: "string?",
      project: "Project",
      title: "string",
      workers: "Worker[]",
      from: "date",
      to: "date?",
      description: "string?",
      process: "string?",
      unit: "string?",
      quantity: "double?"
    },
    primaryKey: "_id",
  }
}

export class Task extends Realm.Object<Task> {
  _id!: BSON.ObjectId
  createAt!: Date
  project!: Project
  title!: string
  isDone!: boolean
  workers!: Realm.List<Worker>
  dueDate?: Date
  description?: string
  static schema: ObjectSchema = {
    name: "Task",
    properties: {
      _id: { type: "objectId", default: () => new Realm.BSON.ObjectID() },
      createdAt: { type: "date", default: () => new Date() },
      project: "Project",
      title: "string",
      isDone: { type: "bool", default: false },
      workers: "Worker[]",
      dueDate: "date?",
      description: "string?",
    },
    primaryKey: "_id",
  }
}
