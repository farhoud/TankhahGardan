import { ReceiptItemModel } from "./ReceiptItem"

test("can be created", () => {
  const instance = ReceiptItemModel.create({})

  expect(instance).toBeTruthy()
})
