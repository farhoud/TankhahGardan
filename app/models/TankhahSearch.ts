import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { OperationEnum } from "./Shared"

/**
 * Model description here for TypeScript hints.
 */
export const TankhahSearchModel = types
  .model("TankhahSearch")
  .props({
    opFilter: types.optional(types.array(types.string), []),
    pmFilter: types.optional(types.array(types.string), []),
    gpFilter: types.optional(types.array(types.string), [])
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface TankhahSearch extends Instance<typeof TankhahSearchModel> { }
export interface TankhahSearchSnapshotOut extends SnapshotOut<typeof TankhahSearchModel> { }
export interface TankhahSearchSnapshotIn extends SnapshotIn<typeof TankhahSearchModel> { }
export const createTankhahSearchDefaultModel = () => types.optional(TankhahSearchModel, {})
