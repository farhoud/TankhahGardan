import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import createForm from "mst-form-type"

// form schema
export const NoteFormSchema = {
  static: [
    {
      id: "title",
      default: "",
      validator: "required"
    },
    {
      id: "text",
      default: "",
      validator: "required"
    },
    {
      id: "happenedAt",
      default: new Date(),
      validator: "required"
    },
  ]
}

export const NoteFormModel = createForm(NoteFormSchema)

