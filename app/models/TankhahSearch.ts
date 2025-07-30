import { Instance, SnapshotIn, SnapshotOut, cast, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { OperationEnum, PaymentMethodEnum } from "./Shared"
import { BSON, Realm, UpdateMode } from "realm"
import { TankhahArchiveItem, TankhahGroup, TankhahItem } from "./realm/tankhah"
import { SearchFilterModel } from "./SearchFilter"
import { SearchResultItemModel } from "./SearchResultItem"
import { TxKeyPath, translate } from "app/i18n"
import { tomanFormatter } from "app/utils/formatDate"

/**
 * Model description here for TypeScript hints.
 */
export const TankhahSearchModel = types
  .model("TankhahSearch")
  .props({
    query: types.optional(types.string, ""),
    archiveId: types.maybe(types.string),
    opFilter: types.optional(types.array(SearchFilterModel), []),
    pmFilter: types.optional(types.array(SearchFilterModel), []),
    gpFilter: types.optional(types.array(SearchFilterModel), []),
    result: types.optional(types.array(SearchResultItemModel), [])
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get opFilterList() {
      return self.opFilter.filter(i => i.value).map(i => i.id)
    },
    get gpFilterList() {
      return self.gpFilter.filter(i => i.value).map(i => new BSON.ObjectId(i.id))
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions(self => {
    let realmIns: Realm | undefined = undefined
    function clean() {
      self.gpFilter = cast([])
      self.opFilter = cast([])
      self.pmFilter = cast([])
      self.query = ""
      self.result = cast([])

      if (self.archiveId) {
        realmIns?.objects(TankhahGroup).forEach(i => {
          self.gpFilter.push(cast({ id: i._id.toHexString(), name: i.name }))
        })
      } else {
        realmIns?.objects(TankhahGroup).filtered("active == true").forEach(i => {
          self.gpFilter.push(cast({ id: i._id.toHexString(), name: i.name }))
        })
      }

      Object.entries(OperationEnum).forEach(([k, v]) => {
        self.opFilter.push(cast({ id: k, name: v }))
      })

      Object.entries(PaymentMethodEnum).forEach(([k, v]) => {
        self.pmFilter.push(cast({ id: k, name: v }))
      })
    }
    function toggle(group: "op" | "gp" | "pm", id: string) {
      if (group === "op") {
        self.opFilter.find(i => i.id === id)?.toggle()
      }
      if (group === "gp") {
        self.gpFilter.find(i => i.id === id)?.toggle()
      }
      if (group === "pm") {
        self.pmFilter.find(i => i.id === id)?.toggle()
      }
    }
    function setRealm(realm: Realm) {
      if (!realmIns)
        realmIns = realm
    }
    function search() {
      if (!realmIns) {
        return
      }
      if (self.query === "" && !self.archiveId) {
        self.result = cast([])
        return
      }
      const iconMap = {
        fund: "cash-plus",
        buy: "cash-register",
        transfer: "cash-fast",
      }
      const formatTitle = (item: TankhahItem | TankhahArchiveItem) => {
        switch (item.opType) {
          case OperationEnum.fund:
            return `دریافت`
          case OperationEnum.buy:
            return `${item.receiptItems?.map((i) => `${i.title}`).join("، ")}`
          case OperationEnum.transfer:
            return `${translate(("paymentMethod." + item.paymentMethod) as TxKeyPath)} به ${item.recipient || item.accountNum || "نامشخص"}`
          default:
            return ""
        }
      }

      self.result = cast((self.archiveId ? realmIns.objects(TankhahArchiveItem) : realmIns.objects(TankhahItem))
        .filtered(...getQueryString(self.archiveId, self.query, self.opFilterList, self.gpFilterList))
        .sorted("doneAt", true)
        .map(i => ({
          id: i._id.toHexString(),
          title: formatTitle(i),
          description: i.description || "",
          timestamp: i.doneAt,
          icon: iconMap[i.opType],
          rightText: tomanFormatter(i.total),
        }))) || cast([])
    }
    return {
      clean,
      toggle,
      search,
      setRealm,
    }
  }) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface TankhahSearch extends Instance<typeof TankhahSearchModel> { }
export interface TankhahSearchSnapshotOut extends SnapshotOut<typeof TankhahSearchModel> { }
export interface TankhahSearchSnapshotIn extends SnapshotIn<typeof TankhahSearchModel> { }
export const createTankhahSearchDefaultModel = () => types.optional(TankhahSearchModel, {})

function getQueryString(
  archiveId?: string,
  searchQuery?: string,
  opFilters?: string[],
  groups?: BSON.ObjectId[],
): [string, ...Array<string | string[] | BSON.ObjectId[]>] {
  const parts = []
  const args: Array<string | string[] | BSON.ObjectId[]> = []
  let index = 0
  if (archiveId) {
    parts.push(`archiveId == $${index}`)
    args.push(archiveId)
    index++
  }
  if (searchQuery) {
    parts.push(`(description CONTAINS $${index} OR recipient CONTAINS $${index} OR trackingNum CONTAINS $${index} OR receiptItems.title CONTAINS $0)`)
    args.push(searchQuery)
    index++
  }
  if (opFilters && opFilters.length > 0) {
    parts.push(`opType IN $${index}`)
    args.push(opFilters)
    index++
  }

  if (groups && groups.length > 0) {
    parts.push(`group._id IN $${index}`)
    args.push(groups)
    index++
  }
  return [parts.join(" AND "), ...args]
}
