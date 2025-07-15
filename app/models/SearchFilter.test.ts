import { SearchFilterModel } from "./SearchFilter"

test("can be created", () => {
  const instance = SearchFilterModel.create({})

  expect(instance).toBeTruthy()
})
