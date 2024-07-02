import { CalendarStoreModel } from "./CalendarStore"

test("can be created", () => {
  const instance = CalendarStoreModel.create({})

  expect(instance).toBeTruthy()
})
