import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const ShareIntentItemModel = types
  .model("ShareIntentItem")
  .props({
    id: types.identifier,
    text: types.string,
    loading: types.optional(types.boolean, false),
    error: types.maybe(types.string),
    complete: types.optional(types.boolean, false),
    createdAt: types.optional(types.Date, () => new Date())
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    failed(err: string) {
      self.error = err
      self.loading = false
    },
    done() {
      self.error = undefined
      self.complete = true
      self.loading = false
    },
    start() {
      self.error = undefined
      self.loading = true
      self.complete = false
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface ShareIntentItem extends Instance<typeof ShareIntentItemModel> { }
export interface ShareIntentItemSnapshotOut extends SnapshotOut<typeof ShareIntentItemModel> { }
export interface ShareIntentItemSnapshotIn extends SnapshotIn<typeof ShareIntentItemModel> { }
// export const createShareIntentItemDefaultModel = () => types.optional(ShareIntentItemModel, {})
