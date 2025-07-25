import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { formatDateIR } from "app/utils/formatDate"

/**
 * Model description here for TypeScript hints.
 */
export const TankhahPrintItemModel = types
  .model("TankhahPrintItem")
  .props({
    opType: types.string,
    date: types.Date,
    amount: types.number,
    description: types.maybe(types.string),
    fee: types.number,
    info: types.string,
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get fdate() {
      return formatDateIR(self.date)
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface TankhahPrintItem extends Instance<typeof TankhahPrintItemModel> { }
export interface TankhahPrintItemSnapshotOut extends SnapshotOut<typeof TankhahPrintItemModel> { }
export interface TankhahPrintItemSnapshotIn extends SnapshotIn<typeof TankhahPrintItemModel> { }
// export const createTankhahPrintItemDefaultModel = () => types.optional(TankhahPrintItemModel, {})
