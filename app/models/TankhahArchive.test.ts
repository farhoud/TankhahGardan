import { TankhahArchiveModel } from "./TankhahArchive"

test("can be created", () => {
  const instance = TankhahArchiveModel.create({})

  expect(instance).toBeTruthy()
})
