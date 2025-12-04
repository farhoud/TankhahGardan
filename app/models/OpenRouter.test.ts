import { OpenRouterModel } from "./OpenRouter"

test("can be created", () => {
  const instance = OpenRouterModel.create({})

  expect(instance).toBeTruthy()
})
