import { AttendanceFormStoreModel } from "./AttendanceFormStore"

test("can be created", () => {
  const instance = AttendanceFormStoreModel.create({})

  expect(instance).toBeTruthy()
})
