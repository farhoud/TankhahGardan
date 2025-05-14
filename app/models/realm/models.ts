import Realm from "realm"
import { Attendance, CalenderNote, Project, Worker } from "./calendar"
import { Note } from "./note"
import { Spend, ReceiptItem, SpendReceiptItem, TankhahItem, TankhahReceiptItem, Fund } from "./tankhah"


export const realmConfig: Realm.Configuration = {
  schema: [
    Fund,
    Spend,
    ReceiptItem,
    SpendReceiptItem,
    TankhahItem,
    TankhahReceiptItem,
    Worker,
    Attendance,
    CalenderNote,
    Project,
    Note,
  ],
  // Increment the 'schemaVersion', since 'fullName' has replaced
  // 'firstName' and 'lastName' in the schema.
  // The initial schemaVersion is 0.
  schemaVersion: 19,

  onMigration: (oldRealm: Realm, newRealm: Realm) => {
    // only apply this change if upgrading schemaVersion
    if (oldRealm.schemaVersion < 9) {
      const oldFunObjects: Realm.Results<Fund> = oldRealm.objects(Fund)
      const oldSpendObjects: Realm.Results<Spend> = newRealm.objects(Spend)
      // loop through all objects and set the fullName property in the
      // new schema
      for (const obj of oldSpendObjects) {
        const newObj = obj.toJSON()
        if (!!newObj.paymentType) {
          newObj.opType = newObj.paymentType
          delete newObj.paymentType
        } else {
          newObj.opType = "transfer"
        }
        newRealm.create(TankhahItem, newObj)
      }
      for (const obj of oldFunObjects) {
        const newObj = obj.toJSON()
        newObj.opType = "fund"
        newObj.paymentMethod = "cash"
        newObj.transferFee = 0
        newObj.total = newObj.amount
        newRealm.create(TankhahItem, newObj)
      }
    }
    if (oldRealm.schemaVersion < 14) {
      const oldAttendances: Realm.Results<Attendance> = oldRealm.objects(Attendance)
      const newAttendances: Realm.Results<Attendance> = newRealm.objects(Attendance)
      const groups = oldAttendances.filtered("group != '' DISTINCT(group)")

      const mapGroupProject: Record<string, Project> = {}
      groups.forEach((i) => {
        const item = newRealm.create(Project, {
          name: i.group,
        })
        // @ts-ignore old schema < 14 group was mandatory
        mapGroupProject[i.group] = item
      })

      for (const objectIndex in oldAttendances) {
        const oldObject = oldAttendances[objectIndex]
        const newObject = newAttendances[objectIndex]
        // @ts-ignore old schema < 14 group was mandatory
        newObject.project = mapGroupProject[oldObject.group]
      }
    }
  },
}
