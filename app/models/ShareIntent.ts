import { Instance, SnapshotIn, SnapshotOut, types, flow, getRoot } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { ShareIntentItemModel } from "./ShareIntentItem"
import { BSON } from "realm"
import { Alert } from "react-native"
import { api } from "app/services/api"
import { SpendFormStoreModel } from "./SpendFormStore"
import { getRootStore } from "./helpers/getRootStore"
import { RootStore } from "./RootStore"

/**
 * Model description here for TypeScript hints.
 */
export const ShareIntentModel = types
  .model("ShareIntent")
  .props({
    list: types.optional(types.array(ShareIntentItemModel), []),
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    parseText: flow(function* parseText(id: string, apiKey: string, model: string) {
      const item = self.list.find((i) => i.id === id)
      if (!item) {
        Alert.alert("wrong item id")
        return
      }
      item.start()
      try {
        const res = yield api.extractInfo(item.text, apiKey, model)
        if (res.kind === "bad-data" || res.kind !== "ok") {
          item.failed(res.kind)
          return
        }
        if (Object.keys(res.extracted).length === 0) {
          item.failed("exteraction failed")
          return
        }
        item.extracted = SpendFormStoreModel.create(res.extracted!)
        console.debug(item.extracted)
        item.done()
      } catch (e) {
        if (e instanceof Error) {
          item.failed(e.toString())
        } else {
          item.failed(String(e))
        }
      }
    }),
  }))
  .actions((self) => ({
    addNewShareIntent(text: string) {
      const id = new BSON.UUID().toHexString()
      self.list.push({
        id,
        text,
      })
      // self.parseText(id)
    },
    deleteListItem(id: string) {
      const value = self.list.find((i) => i.id === id)
      if (value) {
        self.list.remove(value)
      }
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface ShareIntent extends Instance<typeof ShareIntentModel> { }
export interface ShareIntentSnapshotOut extends SnapshotOut<typeof ShareIntentModel> { }
export interface ShareIntentSnapshotIn extends SnapshotIn<typeof ShareIntentModel> { }
export const createShareIntentDefaultModel = () => types.optional(ShareIntentModel, {})
