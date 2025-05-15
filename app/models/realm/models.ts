import Realm from "realm"
import { Attendance, CalenderNote, Project, Worker } from "./calendar"
import { Note } from "./note"
import { ReceiptItem, TankhahItem, EmbeddedReceiptItem, TankhahGroup } from "./tankhah"


export const realmConfig: Realm.Configuration = {
  schema: [
    ReceiptItem,
    EmbeddedReceiptItem,
    TankhahItem,
    TankhahGroup,
    Worker,
    Attendance,
    CalenderNote,
    Project,
    Note,
  ],
  // Increment the 'schemaVersion', since 'fullName' has replaced
  // 'firstName' and 'lastName' in the schema.
  // The initial schemaVersion is 0.
  schemaVersion: 21,

  onMigration: (oldRealm: Realm, newRealm: Realm) => {

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
    if (oldRealm.schemaVersion < 21) {
      const oldTankhahItems: Realm.Results<TankhahItem> = oldRealm.objects(TankhahItem)
      const newTankhahItems: Realm.Results<TankhahItem> = newRealm.objects(TankhahItem)
      const groups = oldTankhahItems.filtered("group != '' DISTINCT(group)") 

      const mapGroupProject: Record<string, TankhahGroup> = {}
      groups.forEach((i) => {
        // @ts-ignore migration script, old schema had string type
        if (i.group == "no_group") {
          return
        }
        // @ts-ignore migration script, old schema had string type
        const item = newRealm.create(TankhahGroup, {
          name: i.group,
        })
        // @ts-ignore migration script, old schema had string type
        mapGroupProject[i.group] = item
      })

      for (const objectIndex in oldTankhahItems) {
        const oldObject = oldTankhahItems[objectIndex]
        const newObject = newTankhahItems[objectIndex]
        // @ts-ignore migration script, old schema had string type
        if (oldObject.group == "no_group") {
          newObject.group = undefined
        } else {
          // @ts-ignore migration script, old schema had string type
          newObject.group = mapGroupProject[oldObject.group]
        }
      }
    }
  },
}
