import { SpendFormStoreModel } from "./SpendFormStore"

test("can be created", () => {
  const instance = SpendFormStoreModel.create({})

  expect(instance).toBeTruthy()
})
