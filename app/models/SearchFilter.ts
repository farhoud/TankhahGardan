import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const SearchFilterModel = types
  .model("SearchFilter")
  .props({
    name: types.string,
    id: types.string,
    value: types.optional(types.boolean, true)
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    toggle: () => {
      self.value = !self.value
    },
    reset: () => {
      self.value = true
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SearchFilter extends Instance<typeof SearchFilterModel> { }
export interface SearchFilterSnapshotOut extends SnapshotOut<typeof SearchFilterModel> { }
export interface SearchFilterSnapshotIn extends SnapshotIn<typeof SearchFilterModel> { }
// export const createSearchFilterDefaultModel = () => types.optional(SearchFilterModel, {})
