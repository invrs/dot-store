import GetSet from "../dist"

let store

beforeEach(() => {
  store = new GetSet({ test: true })
})

test("gets value", () => {
  expect(store.get("test")).toBe(true)
})

test("emits mutation", async () => {
  let fn = jest.fn()

  store.subscribe(fn)
  await store.set("test", false)

  expect(fn).toHaveBeenCalledWith({
    op: "set",
    prop: "test",
    state: { test: false },
    value: false,
  })
  expect(store.get("test")).toBe(false)
})
