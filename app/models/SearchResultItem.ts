import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const SearchResultItemModel = types
  .model("SearchResultItem")
  .props({
    id: types.string,
    title: types.string,
    description: types.string
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SearchResultItem extends Instance<typeof SearchResultItemModel> { }
export interface SearchResultItemSnapshotOut extends SnapshotOut<typeof SearchResultItemModel> { }
export interface SearchResultItemSnapshotIn extends SnapshotIn<typeof SearchResultItemModel> { }
// export const createSearchResultItemDefaultModel = () => types.optional(SearchResultItemModel, {})
