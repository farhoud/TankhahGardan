import { Instance, SnapshotIn, SnapshotOut, cast, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { SearchFilter, SearchFilterModel } from "./SearchFilter"
import { BSON, Realm, UpdateMode } from "realm"
import { TankhahGroup, TankhahItem } from "./realm/tankhah"
import { TankhahPrintItemModel } from "./TankhahPrintItem"
import { endOfDay, startOfDay, subMonths } from "date-fns-jalali"
import { htmlBase, renderFundContent, renderSpendContent } from "app/utils/print-template"
import * as Print from "expo-print"
import { formatDateIR } from "app/utils/formatDate"
import { formatTitle } from "./Shared"

enum OperationEnum {
  spend = "spend",
  fund = "fund",
}

const getQueryString = (
  startDate: Date,
  endDate: Date,
  opFilter?: SearchFilter,
  group?: SearchFilter,
): [string, ...Array<Date | string | BSON.ObjectId>] => {
  const baseQuery = "doneAt BETWEEN { $0 , $1 } SORT(doneAt ASC)"
  let query = baseQuery
  const args: Array<Date | string | BSON.ObjectId> = [startDate, endDate]
  switch (opFilter?.id) {
    case OperationEnum.fund:
      query = `opType == "${opFilter.id}" AND ` + query
      break
    case OperationEnum.spend:
      query = 'opType != "fund" AND ' + query
      break
  }
  if (group && group.id !== "all") {
    query = "group._id == $2 AND " + query
    args.push(new BSON.ObjectId(group.id))
  }
  return [query, ...args]
}
/**
 * Model description here for TypeScript hints.
 */
export const TankhahPrintModel = types
  .model("TankhahPrint")
  .props({
    start: types.optional(types.Date, startOfDay(subMonths(new Date(), 1))),
    end: types.optional(types.Date, endOfDay(new Date())),
    opFilterOpen: types.optional(types.boolean, false),
    gpFilterOpen: types.optional(types.boolean, false),
    opFilter: types.optional(types.array(SearchFilterModel), []),
    gpFilter: types.optional(types.array(SearchFilterModel), []),
    items: types.optional(types.array(TankhahPrintItemModel), []),
    loading: types.optional(types.boolean, false),
    error: types.maybe(types.string),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get selectedOpFilter() {
      return self.opFilter.filter((i) => i.value).at(0)
    },
    get selectedGpFilter() {
      return self.gpFilter.filter((i) => i.value).at(0)
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => {
    let realm: Realm | undefined
    function setRealm(r: Realm) {
      realm = r
    }
    function clear() {
      self.opFilter = cast([])
      self.gpFilter = cast([])
      self.error = undefined
      self.loading = false
      realm
        ?.objects(TankhahGroup)
        .filtered("active == true")
        .forEach((i) => {
          self.gpFilter.push(cast({ id: i._id.toHexString(), name: i.name, value: false }))
        })
      self.gpFilter.push({ id: "all", name: "all" })
      Object.entries(OperationEnum).forEach(([k, v]) => {
        self.opFilter.push(cast({ id: k, name: v, value: v === "spend" }))
      })
    }
    async function print() {
      self.loading = true
      if (!realm) {
        self.error = "db not found"
        return
      }
      try {
        const items = realm
          .objects(TankhahItem)
          .filtered(
            ...getQueryString(self.start, self.end, self.selectedOpFilter, self.selectedGpFilter),
          )
        self.items = cast(
          items.map((i) => ({
            opType: i.opType,
            date: i.doneAt,
            description: i.description || undefined,
            fee: i.transferFee,
            info: formatTitle(i),
            amount: i.total,
          })),
        )
        const total = items.sum("total")
        const fTotal = new Intl.NumberFormat("fa-IR", {
          // style: 'currency',
          // currency: 'IRR',
          maximumFractionDigits: 0,
        }).format(total)
        const fStart = formatDateIR(self.start)
        const fEnd = formatDateIR(self.end)
        if (self.selectedOpFilter?.id == "fund") {
          const body = renderFundContent(self.items, fTotal, fStart, fEnd)
          await Print.printAsync({
            html: htmlBase(body),
          })
        } else if (self.selectedOpFilter?.id == "spend") {
          const body = renderSpendContent(
            self.items,
            fTotal,
            self.selectedGpFilter?.name || "ثبت نشده",
            fStart,
            fEnd,
          )
          await Print.printAsync({
            html: htmlBase(body),
          })
        }
      } catch (e) {
        if (e instanceof Error) {
          self.error = e.message
        } else {
          self.error = String(e)
        }
      }
      setTimeout(() => {
        self.setProp("loading", false)
      }, 100)
    }

    function selectOpFilter(id: string) {
      self.opFilter.forEach((i) => i.setProp("value", id === i.id))
      self.opFilterOpen = false
    }

    function selectGpFilter(id: string) {
      self.gpFilter.forEach((i) => i.setProp("value", id === i.id))
      self.gpFilterOpen = false
    }
    return {
      setRealm,
      print,
      clear,
      selectGpFilter,
      selectOpFilter,
    }
  }) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface TankhahPrint extends Instance<typeof TankhahPrintModel> {}
export interface TankhahPrintSnapshotOut extends SnapshotOut<typeof TankhahPrintModel> {}
export interface TankhahPrintSnapshotIn extends SnapshotIn<typeof TankhahPrintModel> {}
export const createTankhahPrintDefaultModel = () => types.optional(TankhahPrintModel, {})
