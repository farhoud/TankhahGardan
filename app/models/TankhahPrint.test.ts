import { TankhahPrintModel } from "./TankhahPrint"

test("can be created", () => {
  const instance = TankhahPrintModel.create({})

  expect(instance).toBeTruthy()
})
