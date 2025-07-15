import { SearchResultItemModel } from "./SearchResultItem"

test("can be created", () => {
  const instance = SearchResultItemModel.create({})

  expect(instance).toBeTruthy()
})
