import Realm from "realm";

class Project extends Realm.Object<Project> {
  _id!: Realm.BSON.ObjectId;
  name!: string;
  client!: string;
  startDate!: Date;
  endDate?: Date;
  status!: string;
  sections!: Realm.List<Section>;
  reports!: Realm.List<Report>;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: "Project",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      name: "string",
      client: "string",
      startDate: "date",
      endDate: "date?",
      status: "string",
      sections: "Section[]",
      reports: "Report[]",
      createdAt: "date",
      updatedAt: "date",
    },
  };
}

class Section extends Realm.Object<Section> {
  _id!: Realm.BSON.ObjectId;
  name!: string;
  description!: string;
  items!: Realm.List<Item>;
  project!: Realm.Results<Project>;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: "Section",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      name: "string",
      description: "string",
      items: "Item[]",
      project: { type: "linkingObjects", objectType: "Project", property: "sections" },
      createdAt: "date",
      updatedAt: "date",
    },
  };
}

class Item extends Realm.Object<Item> {
  _id!: Realm.BSON.ObjectId;
  name!: string;
  unit!: string;
  unitPrice!: number;
  quantity!: number;
  totalPrice!: number;
  section!: Realm.Results<Section>;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: "Item",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      name: "string",
      unit: "string",
      unitPrice: "double",
      quantity: "double",
      totalPrice: "double",
      section: { type: "linkingObjects", objectType: "Section", property: "items" },
      createdAt: "date",
      updatedAt: "date",
    },
  };
}

class Report extends Realm.Object<Report> {
  _id!: Realm.BSON.ObjectId;
  date!: Date;
  totalAmount!: number;
  description!: string;
  items!: Realm.List<ReportItem>;
  project!: Realm.Results<Project>;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: "Report",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      date: "date",
      totalAmount: "double",
      description: "string",
      items: "ReportItem[]",
      project: { type: "linkingObjects", objectType: "Project", property: "reports" },
      createdAt: "date",
      updatedAt: "date",
    },
  };
}

class ReportItem extends Realm.Object<ReportItem> {
  _id!: Realm.BSON.ObjectId;
  itemId!: Realm.BSON.ObjectId;
  quantity!: number;
  unitPrice!: number;
  totalPrice!: number;
  report!: Realm.Results<Report>;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: "ReportItem",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      itemId: "objectId",
      quantity: "double",
      unitPrice: "double",
      totalPrice: "double",
      report: { type: "linkingObjects", objectType: "Report", property: "items" },
      createdAt: "date",
      updatedAt: "date",
    },
  };
}

