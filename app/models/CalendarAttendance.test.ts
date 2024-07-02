import { CalendarAttendanceModel } from "./CalendarAttendance"

test("can be created", () => {
  const instance = CalendarAttendanceModel.create({})

  expect(instance).toBeTruthy()
})
