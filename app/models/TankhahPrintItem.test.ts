import { TankhahPrintItemModel } from "./TankhahPrintItem"

test("can be created", () => {
  const instance = TankhahPrintItemModel.create({})

  expect(instance).toBeTruthy()
})
