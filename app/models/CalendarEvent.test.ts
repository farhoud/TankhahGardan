import { CalendarEventModel } from "./CalendarEvent"

test("can be created", () => {
  const instance = CalendarEventModel.create({})

  expect(instance).toBeTruthy()
})
