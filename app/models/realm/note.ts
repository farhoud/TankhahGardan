
import Realm, { BSON, ObjectSchema } from "realm"
import { Project } from "./calendar"

export class Tag extends Realm.Object<Tag> {
  _id!: BSON.ObjectId
  createAt!: Date
  text!: string
  static schema: ObjectSchema = {
    name: "Task",
    properties: {
      _id: { type: "objectId", default: () => new Realm.BSON.ObjectID() },
      createdAt: { type: "date", default: () => new Date() },
      text: "string",
    },
    primaryKey: "_id",
  }
}

export class Note extends Realm.Object<Note> {
  _id!: BSON.ObjectId
  createAt!: Date
  project!: Project
  title!: string
  isDraft!: boolean
  text!: string
  attachment!: string[]
  tags!: string[]
  static schema: ObjectSchema = {
    name: "Task",
    properties: {
      _id: { type: "objectId", default: () => new Realm.BSON.ObjectID() },
      createdAt: { type: "date", default: () => new Date() },
      project: "Project",
      title: "string",
      isDraft: { type: "bool", default: false },
      attachments: { type: "list", optional: true, objectType: "string" },
      text: "string",
      tags: "string[]",
    },
    primaryKey: "_id",
  }
}
