import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const TankhahArchiveItemModel = types
  .model("TankhahArchiveItem")
  .props({
    start: types.Date,
    end: types.Date,
    id: types.string,
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface TankhahArchiveItem extends Instance<typeof TankhahArchiveItemModel> { }
export interface TankhahArchiveItemSnapshotOut extends SnapshotOut<typeof TankhahArchiveItemModel> { }
export interface TankhahArchiveItemSnapshotIn extends SnapshotIn<typeof TankhahArchiveItemModel> { }
// export const createTankhahArchiveItemDefaultModel = () => types.optional(TankhahArchiveItemModel, {})
