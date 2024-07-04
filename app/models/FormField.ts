import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { identifier } from "mobx-state-tree/dist/internal"

/**
 * Model description here for TypeScript hints.
 */
export const FormFieldModel = types
  .model("FormField")
  .props({
    name: types.identifier,
    value: types.union(types.Date, types.string, types.array(types.string), types.undefined),
    default: types.union(types.Date, types.string, types.array(types.string), types.undefined),
    touched: types.optional(types.boolean, false),
    error: types.optional(types.boolean, false),
    msg: types.maybe(types.string),
  })
  .volatile((self)=>({
    validator:(value: typeof self.value)=>{
      return true
    }
  }))
  .actions(withSetPropAction)
  .views((self) => ({
    get isValid(){
      return self.validator(self.value)
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    clear: () => {
      self.value = undefined
      self.error = false
      self.msg = undefined
      self.touched = false
    },
  }))

export interface FormField extends Instance<typeof FormFieldModel> {}
export interface FormFieldSnapshotOut extends SnapshotOut<typeof FormFieldModel> {}
export interface FormFieldSnapshotIn extends SnapshotIn<typeof FormFieldModel> {}
export const createFormFieldDefaultModel = (name: string, defaultValue?: FormField["default"]) =>
  types.optional(FormFieldModel, { name, default: defaultValue })
