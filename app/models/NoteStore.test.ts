import { NoteStoreModel } from "./NoteStore"

test("can be created", () => {
  const instance = NoteStoreModel.create({})

  expect(instance).toBeTruthy()
})

