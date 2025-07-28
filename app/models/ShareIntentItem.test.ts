import { ShareIntentItemModel } from "./ShareIntentItem"

test("can be created", () => {
  const instance = ShareIntentItemModel.create({})

  expect(instance).toBeTruthy()
})
