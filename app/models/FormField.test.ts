import { FormFieldModel } from "./FormField"

test("can be created", () => {
  const instance = FormFieldModel.create({})

  expect(instance).toBeTruthy()
})
