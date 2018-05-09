import GetSet from "../dist"

let store

beforeEach(() => {
  store = new GetSet({ test: true })
})

test("gets value", async () => {
  expect(store.getSync("test")).toBe(true)
  expect(await store.get("test")).toBe(true)
})

test("detectChange", async () => {
  expect.assertions(5)

  store.subscribe(({ detectChange }) => {
    expect(detectChange("nested")).toEqual({})
    expect(detectChange("nested.{key}")).toEqual({
      key: "value",
    })
    expect(detectChange("nested.value.test")).toEqual({})
    expect(detectChange("nested.{key1}.{key2}")).toEqual({
      key1: "value",
      key2: "test",
    })
    expect(detectChange("nested.value.test.test2")).toBe(
      false
    )
  })

  await store.set("nested.value.test", true)
})

test("detectChange equality", async () => {
  await store.set("nested.value.test", true)

  expect.assertions(4)

  store.subscribe(({ detectChange }) => {
    expect(detectChange("nested")).toEqual({})
    expect(detectChange("nested.{key}")).toEqual({
      key: "value",
    })
    expect(detectChange("nested.value.test")).toBe(false)
    expect(detectChange("nested.value.test.test2")).toBe(
      false
    )
  })

  await store.set("nested.value.test", true)
})

test("dispatches subscribe events", async () => {
  let fn1 = jest.fn()
  let fn2 = jest.fn()

  store.subscribe(fn1)
  store.subscribe("afterSet", fn2)

  await store.set("test", false)

  let payload = {
    detectChange: expect.any(Function),
    op: "set",
    prevState: { test: true },
    prop: "test",
    props: ["test"],
    state: { test: false },
    store: expect.any(Object),
    value: false,
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(fn2).toHaveBeenCalledWith(payload)

  expect(await store.get("test")).toBe(false)
})

test("dispatches on events", async () => {
  let fn1 = jest.fn()

  store.on("test", fn1)

  await store.set("test", false)

  let payload = {
    detectChange: expect.any(Function),
    op: "set",
    prevState: { test: true },
    prop: "test",
    props: ["test"],
    state: { test: false },
    store: expect.any(Object),
    value: false,
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(await store.get("test")).toBe(false)

  await store.set("test", true)
  expect(fn1).toHaveBeenCalledWith(payload)
  expect(await store.get("test")).toBe(true)

  await store.set("test", true)
  expect(fn1.mock.calls.length).toBe(2)
})

test("dispatches once events", async () => {
  let fn1 = jest.fn()

  store.once("test", fn1)

  await store.set("test", false)

  let payload = {
    detectChange: expect.any(Function),
    op: "set",
    prevState: { test: true },
    prop: "test",
    props: ["test"],
    state: { test: false },
    store: expect.any(Object),
    value: false,
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(await store.get("test")).toBe(false)

  await store.set("test", true)

  expect(fn1.mock.calls.length).toBe(1)
  expect(await store.get("test")).toBe(true)
})

test("dispatches oncePresent events", async () => {
  let fn1 = jest.fn()
  store.oncePresent("test", fn1)

  let payload = {
    prop: "test",
    props: ["test"],
    state: { test: true },
    store: expect.any(Object),
    value: true,
  }

  expect(fn1).toHaveBeenCalledWith(payload)
})

test("doesn't dispatch offed events", async () => {
  let fn1 = jest.fn()
  let fn2 = jest.fn()

  store.on("test", fn1)
  store.on("test", fn2)
  store.off("test")

  await store.set("test", false)

  expect(fn1).not.toHaveBeenCalled()
  expect(fn2).not.toHaveBeenCalled()
})
