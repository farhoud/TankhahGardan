import { CalendarNoteModel } from "./CalendarNote"

test("can be created", () => {
  const instance = CalendarNoteModel.create({})

  expect(instance).toBeTruthy()
})
