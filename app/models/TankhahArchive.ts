import { Instance, SnapshotIn, SnapshotOut, cast, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { startOfDay, subMonths, endOfDay } from "date-fns"
import { BSON, Realm } from "realm"
import { SpendReceiptItem, TankhahArchiveItem, TankhahItem } from "./realm/tankhah"
import { TankhahArchiveItemModel } from "./TankhahArchiveItem"

/**
 * Model description here for TypeScript hints.
 */
export const TankhahArchiveModel = types
  .model("TankhahArchive")
  .props({
    startDate: types.optional(types.Date, startOfDay(subMonths(new Date(), 1))),
    endDate: types.optional(types.Date, endOfDay(new Date())),
    progress: types.optional(types.number, 0),
    archiving: types.optional(types.boolean, false),
    archiveId: types.optional(types.string, ""),
    confirm: types.optional(types.boolean, false),
    count: types.optional(types.integer, 0),
    fundSum: types.optional(types.integer, 0),
    spendSum: types.optional(types.integer, 0),
    diff: types.optional(types.integer, 0),
    archiveList: types.optional(types.array(TankhahArchiveItemModel), []),
    error: types.maybe(types.string)
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => {
    let realm: Realm | undefined
    function setRealm(r: Realm) {
      if (!realm)
        realm = r
      self.archiveList = cast([])
      realm.objects(TankhahArchiveItem).filtered("archiveId != $0 DISTINCT(archiveId)", null).forEach(i => {
        console.log(i.archiveId)
        self.archiveList.push({ start: i.archiveStart, end: i.archiveEnd, id: i.archiveId })
      })
    }
    function clear() {
      self.progress = 0
      self.archiving = false
      self.error = undefined
      self.archiveId = ""
      self.confirm = false
    }
    function showConfirm() {
      if (!realm) {
        self.error = "database not avalible"
        return
      }
      const funds = realm?.objects(TankhahItem).filtered("doneAt BETWEEN { $0 , $1 } AND opType == 'fund'", self.startDate, self.endDate)
      const spends = realm?.objects(TankhahItem).filtered("doneAt BETWEEN { $0 , $1 }  AND opType != 'fund'", self.startDate, self.endDate)
      self.fundSum = funds.sum("total")
      self.spendSum = spends.sum("total")
      self.diff = self.fundSum - self.spendSum
      self.confirm = true
    }
    function archiveTankhahItems() {
      if (!realm) {
        self.error = "database not avalible"
        return
      }
      if (self.archiving) {
        self.error = "already working"
      }
      self.archiving = true;
      self.archiveId = new BSON.UUID().toString()
      realm?.beginTransaction()
      try {
        const items = realm?.objects(TankhahItem).filtered("doneAt BETWEEN { $0 , $1 } SORT(doneAt DESC)", self.startDate, self.endDate).slice()
        let index = 0
        for (const i of items) {
          const receiptItems = i.receiptItems?.map(i => { return { amount: i.amount, title: i.title, price: i.price } })
          // @ts-ignore
          realm.create(TankhahArchiveItem, { ...i, archiveStart: self.startDate, archiveEnd: self.endDate, archiveId: self.archiveId, receiptItems })
          realm.delete(i)
          index++
          self.progress = index / items.length
        }
        realm.commitTransaction();
      } catch (e) {
        realm.cancelTransaction();
        if (e instanceof Error)
          self.error = e.message
        else
          self.error = String(e)
      }
    }
    return {
      setRealm,
      archiveTankhahItems,
      showConfirm,
      clear
    }
  }) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface TankhahArchive extends Instance<typeof TankhahArchiveModel> { }
export interface TankhahArchiveSnapshotOut extends SnapshotOut<typeof TankhahArchiveModel> { }
export interface TankhahArchiveSnapshotIn extends SnapshotIn<typeof TankhahArchiveModel> { }
export const createTankhahArchiveDefaultModel = () => types.optional(TankhahArchiveModel, {})
