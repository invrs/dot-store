import GetSet from "../dist"

test("gets value", () => {
  let store = new GetSet({ test: true })
  expect(store.get("test")).toBe(true)
})

test("emits mutation", async () => {
  let fn = jest.fn()
  let store = new GetSet({ test: true })
  store.subscribe(fn)
  await store.set("test", false)
  expect(fn).toHaveBeenCalledWith({ test: false }, "test")
  expect(store.get("test")).toBe(false)
})
