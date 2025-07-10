import { TankhahSearchModel } from "./TankhahSearch"

test("can be created", () => {
  const instance = TankhahSearchModel.create({})

  expect(instance).toBeTruthy()
})
