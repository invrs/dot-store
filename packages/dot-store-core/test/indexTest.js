import GetSet from "../dist"

let store

beforeEach(() => {
  store = new GetSet({ test: true })
})

test("gets value", async () => {
  expect(await store.get("test")).toBe(true)
})

test("dispatches events", async () => {
  let fn1 = jest.fn()
  let fn2 = jest.fn()

  store.subscribe(fn1)
  store.subscribe("afterSet", fn2)

  await store.set("test", false)

  let payload = {
    op: "set",
    prop: "test",
    state: { test: false },
    value: false,
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(fn2).toHaveBeenCalledWith(payload)

  expect(await store.get("test")).toBe(false)
})
