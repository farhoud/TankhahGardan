import { TankhahHomeStoreModel } from "./TankhahHomeStore"

test("can be created", () => {
  const instance = TankhahHomeStoreModel.create({})

  expect(instance).toBeTruthy()
})
