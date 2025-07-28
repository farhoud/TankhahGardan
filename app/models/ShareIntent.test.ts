import { ShareIntentModel } from "./ShareIntent"

test("can be created", () => {
  const instance = ShareIntentModel.create({})

  expect(instance).toBeTruthy()
})
