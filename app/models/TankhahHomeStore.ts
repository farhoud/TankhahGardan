import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { subMonths } from "date-fns"
import { endOfDay, startOfDay } from "date-fns-jalali"
import { OperationType } from "./realm/tankhah"
import { TankhahSearchModel } from "./TankhahSearch"
import { TankhahArchiveModel } from "./TankhahArchive"
import { TankhahPrintModel } from "./TankhahPrint"

type ItemFilterPreset = OperationType | "all" | "spend"

/**
 * Model description here for TypeScript hints.
 */
export const TankhahHomeStoreModel = types
  .model("TankhahHomeStore")
  .props({
    search: types.optional(TankhahSearchModel, {}),
    archive: types.optional(TankhahArchiveModel, {}),
    print: types.optional(TankhahPrintModel, {}),
    startDate: types.optional(types.Date, startOfDay(subMonths(new Date(), 1))),
    endDate: types.optional(types.Date, endOfDay(new Date())),
    selectedGroup: types.optional(types.integer, 0),
    selectedTankhahGroupId: types.maybe(types.string),
    selectedOp: types.optional(
      types.enumeration<ItemFilterPreset | "all" | "spend">("ItemFilterPreset", [
        "all",
        "buy",
        "transfer",
        "fund",
      ]),
      "all",
    ),
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface TankhahHomeStore extends Instance<typeof TankhahHomeStoreModel> { }
export interface TankhahHomeStoreSnapshotOut extends SnapshotOut<typeof TankhahHomeStoreModel> { }
export interface TankhahHomeStoreSnapshotIn extends SnapshotIn<typeof TankhahHomeStoreModel> { }
export const createTankhahHomeStoreDefaultModel = () => types.optional(TankhahHomeStoreModel, {})
