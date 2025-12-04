import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const OpenRouterModel = types
  .model("OpenRouter")
  .props({
    apiKey: types.optional(types.string, ""),
    model: types.optional(types.string, "")
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface OpenRouter extends Instance<typeof OpenRouterModel> { }
export interface OpenRouterSnapshotOut extends SnapshotOut<typeof OpenRouterModel> { }
export interface OpenRouterSnapshotIn extends SnapshotIn<typeof OpenRouterModel> { }
export const createOpenRouterDefaultModel = () => types.optional(OpenRouterModel, {})
