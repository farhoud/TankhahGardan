import { CalendarTaskModel } from "./CalendarTask"

test("can be created", () => {
  const instance = CalendarTaskModel.create({})

  expect(instance).toBeTruthy()
})
