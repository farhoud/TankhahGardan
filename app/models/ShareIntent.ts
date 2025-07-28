import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { ShareIntentItemModel } from "./ShareIntentItem"
import { BSON } from "realm"
import { Alert } from "react-native"
import { api } from "app/services/api"
import { getRootStore } from "./helpers/getRootStore"
import { navigationRef } from "app/navigators"

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
    async parseText(id: string) {
      const item = self.list.find(i => i.id === id)
      if (!item) {
        Alert.alert("wrong item id")
        return
      }
      item.start()
      try {
        const res = await api.extractInfo(item.text)
        if (res.kind === "bad-data" || res.kind !== "ok") {
          item.failed(res.kind)
          return
        }
        if (Object.keys(res.extracted).length === 0) {
          item.failed("exteraction failed")
          return
        }
        const root = getRootStore(self)
        root.spendFormStore.applyFormData(res.extracted)
        navigationRef.navigate("TankhahSpendForm", {})
        item.done()
        // self.list.remove(item)
        self.setProp("list", self.list.filter(i => i.id !== id))
      } catch (e) {
        if (e instanceof Error) {
          item.failed(e.toString())
        } else {
          item.failed(String(e))
        }
      }
    },
  })).actions((self) => ({
    addNewShareIntent(text: string) {
      const id = new BSON.UUID().toHexString()
      self.list.push(
        {
          id,
          text: text,
        }
      )
      self.parseText(id)
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface ShareIntent extends Instance<typeof ShareIntentModel> { }
export interface ShareIntentSnapshotOut extends SnapshotOut<typeof ShareIntentModel> { }
export interface ShareIntentSnapshotIn extends SnapshotIn<typeof ShareIntentModel> { }
export const createShareIntentDefaultModel = () => types.optional(ShareIntentModel, {})
