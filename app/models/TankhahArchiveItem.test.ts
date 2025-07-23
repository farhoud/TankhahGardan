import { TankhahArchiveItemModel } from "./TankhahArchiveItem"

test("can be created", () => {
  const instance = TankhahArchiveItemModel.create({})

  expect(instance).toBeTruthy()
})
