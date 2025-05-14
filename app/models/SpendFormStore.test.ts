import { SpendFormStoreModel } from "./SpendFormStore"
import { PaymentMethod, OperationType } from "app/models/realm/tankhah"

test("can be created", () => {
  const instance = SpendFormStoreModel.create({
    doneAt: new Date(),
    amount: 0,
    paymentMethod: "cash" as PaymentMethod,
    transferFee: 0,
    group: "default",
    opType: "buy" as OperationType
  })

  expect(instance).toBeTruthy()
})
