import { Instance, SnapshotIn, SnapshotOut, cast, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { OperationEnum, PaymentMethodEnum } from "./Shared"
import { BSON, Realm, UpdateMode } from "realm"
import { TankhahGroup, TankhahItem } from "./realm/tankhah"
import { SearchFilterModel } from "./SearchFilter"
import { SearchResultItemModel } from "./SearchResultItem"
import { TxKeyPath, translate } from "app/i18n"

/**
 * Model description here for TypeScript hints.
 */
export const TankhahSearchModel = types
  .model("TankhahSearch")
  .props({
    query: types.optional(types.string, ""),
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
      realmIns?.objects(TankhahGroup)
        .filtered("active == true").forEach(i => {
          // const item = self.gpFilter.find(f => f.id === i._id.toHexString())
          // if (item) {
          //   item.reset()
          // } else {
          self.gpFilter.push(cast({ id: i._id.toHexString(), name: i.name }))
          // }
        })
      Object.entries(OperationEnum).forEach(([k, v]) => {
        // const item = self.opFilter.find(f => f.id === k)
        // if (item) {
        //   item.reset()
        // } else {
        self.opFilter.push(cast({ id: k, name: v }))
        // }
      })

      Object.entries(PaymentMethodEnum).forEach(([k, v]) => {
        // const item = self.pmFilter.find(f => f.id === k)
        // if (item) {
        //   item.reset()
        // } else {
        self.pmFilter.push(cast({ id: k, name: v }))
        // }
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
      if (self.query === "") {
        self.result = cast([])
        return
      }
      const formatTitle = (item: TankhahItem) => {
        switch (item.opType) {
          case OperationEnum.fund:
            return `دریافت`
          case OperationEnum.buy:
            return `خرید  ${item.receiptItems?.map((i) => `${i.title}`).join("، ")}`
          case OperationEnum.transfer:
            return `انتقال وجه ${translate(("paymentMethod." + item.paymentMethod) as TxKeyPath)} به ${item.recipient || item.accountNum || "نامشخص"}`
          default:
            return ""
        }
      }
      self.result = cast(realmIns?.objects(TankhahItem)
        .filtered("(description CONTAINS $0 OR recipient CONTAINS $0 OR trackingNum CONTAINS $0 OR receiptItems.title CONTAINS $0) AND opType IN $1 AND group._id IN $2", self.query, self.opFilterList, self.gpFilterList)
        .map(i => ({
          id: i._id.toHexString(),
          title: formatTitle(i),
          description: i.description || ""
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
