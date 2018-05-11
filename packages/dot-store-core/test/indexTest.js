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

  store.on(({ detectChange }) => {
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

  store.on(({ detectChange }) => {
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

test("dispatches on events", async () => {
  let fn1 = jest.fn()
  let fn2 = jest.fn()

  store.on(fn1)
  store.on("afterSet", fn2)

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

test("dispatches on events with vars", async () => {
  let fn1 = jest.fn()

  store.on("{key}", fn1)

  await store.set("test", false)

  let payload = {
    detectChange: expect.any(Function),
    key: "test",
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
})

test("dispatches once events", async () => {
  let payload

  const promise = store.once("test").then(options => {
    payload = options
  })

  await store.set("test", false)
  await promise

  expect(payload).toEqual({
    detectChange: expect.any(Function),
    op: "set",
    prevState: { test: true },
    prop: "test",
    props: ["test"],
    state: { test: false },
    store: expect.any(Object),
    value: false,
  })
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

test.only("doesn't dispatch offed events", async () => {
  let fn1 = jest.fn()
  let fn2 = jest.fn()

  store.on("afterUpdate", fn1)
  store.on("afterUpdate", fn2)

  store.off("afterUpdate", fn1)

  await store.set("test", false)

  expect(fn1).not.toHaveBeenCalled()
  expect(fn2).toHaveBeenCalled()
})

test("doesn't dispatch offed events (return value)", async () => {
  let fn1 = jest.fn()
  let fn2 = jest.fn()

  let off = store.on("test", fn1)
  store.on("test", fn2)

  off()

  await store.set("test", false)

  expect(fn1).not.toHaveBeenCalled()
  expect(fn2).toHaveBeenCalled()
})
