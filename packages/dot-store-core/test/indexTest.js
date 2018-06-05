import GetSet from "../dist"

let store

beforeEach(() => {
  store = new GetSet({ test: true })
})

test("get", async () => {
  expect(store.getSync("test")).toBe(true)
  expect(await store.get("test")).toBe(true)
})

test("changed", async () => {
  expect.assertions(5)

  store.on(({ changed }) => {
    expect(changed("nested")).toEqual({})
    expect(changed("nested.{key}")).toEqual({
      key: "value",
    })
    expect(changed("nested.value.test")).toEqual({})
    expect(changed("nested.{key1}.{key2}")).toEqual({
      key1: "value",
      key2: "test",
    })
    expect(changed("nested.value.test.test2")).toBe(false)
  })

  await store.set("nested.value.test", true)
})

test("changed nested key", async () => {
  expect.assertions(2)

  await store.set("nested", {})

  store.on(({ changed }) => {
    expect(changed("nested.value.key")).toEqual({})
    expect(changed("nested.value.key2")).toEqual(false)
  })

  await store.set("nested.value", { key: true })
})

test("changed equality", async () => {
  await store.set("nested.value.test", true)

  expect.assertions(4)

  store.on(({ changed }) => {
    expect(changed("nested")).toEqual({})
    expect(changed("nested.{key}")).toEqual({
      key: "value",
    })
    expect(changed("nested.value.test")).toBe(false)
    expect(changed("nested.value.test.test2")).toBe(false)
  })

  await store.set("nested.value.test", true)
})

test("changed mismatch", async () => {
  expect.assertions(3)

  store.on(({ changed }) => {
    expect(changed("foo")).toEqual(false)
    expect(changed("foo.{bar}")).toEqual(false)
    expect(changed("nested.value.test.{bar}")).toEqual(
      false
    )
  })

  await store.set("nested.value.test", true)
})

test("on", async () => {
  let fn1 = jest.fn()
  let fn2 = jest.fn()
  let fn3 = jest.fn()

  store.on(fn1)
  store.on("afterSet", fn2)
  store.on("test", fn3)

  await store.set("test", false)

  let payload = {
    changed: expect.any(Function),
    meta: expect.any(Object),
    op: "set",
    prev: true,
    prevState: { test: true },
    prop: "test",
    props: ["test"],
    state: { test: false },
    store: expect.any(Object),
    value: false,
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(fn2).toHaveBeenCalledWith(payload)
  expect(fn3).toHaveBeenCalledWith(payload)

  expect(await store.get("test")).toBe(false)
})

test.only("on beforeUpdate", async () => {
  let fn1 = jest.fn()
  let fn2 = jest.fn()
  let fn3 = jest.fn()
  let fn4 = jest.fn()

  store.on("beforeUpdate", fn1)
  store.on("beforeUpdate", "test", fn2)
  store.on("beforeUpdate", "test.hello", fn3)
  store.on("beforeUpdate", "blah", fn4)

  await store.set("test", false)

  let payload = {
    changed: expect.any(Function),
    meta: expect.any(Object),
    op: "set",
    prev: true,
    prop: "test",
    props: ["test"],
    state: { test: true },
    store: expect.any(Object),
    value: false,
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(fn2).toHaveBeenCalledWith(payload)
  expect(fn3).toHaveBeenCalledWith(payload)
  expect(fn4).not.toHaveBeenCalledWith(payload)

  expect(await store.get("test")).toBe(false)
})

test("on with prop var", async () => {
  let fn1 = jest.fn()

  store.on("test.{key}", fn1)

  await store.set("test.foo", false)

  let payload = {
    changed: expect.any(Function),
    key: "foo",
    meta: expect.any(Object),
    op: "set",
    prev: undefined,
    prevState: { test: true },
    prop: "test.foo",
    props: ["test", "foo"],
    state: { test: { foo: false } },
    store: expect.any(Object),
    value: false,
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(await store.get("test.foo")).toBe(false)
})

test("on with root prop var", async () => {
  let fn1 = jest.fn()

  store.on("{key}", fn1)

  await store.set("test", false)

  let payload = {
    changed: expect.any(Function),
    key: "test",
    meta: expect.any(Object),
    op: "set",
    prev: true,
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

test("once", async () => {
  let payload

  const promise = store.once("test").then(options => {
    payload = options
  })

  await store.set("test", false)
  await promise

  expect(payload).toEqual({
    changed: expect.any(Function),
    meta: expect.any(Object),
    op: "set",
    prev: true,
    prevState: { test: true },
    prop: "test",
    props: ["test"],
    state: { test: false },
    store: expect.any(Object),
    value: false,
  })
})

test("onceExists", async () => {
  let payload

  const promise = store
    .onceExists("test2")
    .then(options => {
      payload = options
    })

  expect(payload).not.toBeDefined()

  await store.set("test2", true)
  await promise

  expect(payload).toEqual({
    changed: expect.any(Function),
    meta: expect.any(Object),
    op: "set",
    prev: undefined,
    prevState: { test: true },
    prop: "test2",
    props: ["test2"],
    state: { test: true, test2: true },
    store: expect.any(Object),
    value: true,
  })

  payload = await store.onceExists("test2")

  expect(payload).toEqual({
    prev: true,
    prevState: { test: true, test2: true },
    prop: "test2",
    props: ["test2"],
    state: { test: true, test2: true },
    store: expect.any(Object),
    value: true,
  })
})

test("off", async () => {
  let fn1 = jest.fn()
  let fn2 = jest.fn()

  store.on("afterUpdate", fn1)
  store.on("afterUpdate", fn2)

  store.off("afterUpdate", fn1)

  await store.set("test", false)

  expect(fn1).not.toHaveBeenCalled()
  expect(fn2).toHaveBeenCalled()
})

test("off (return value)", async () => {
  let fn1 = jest.fn()
  let fn2 = jest.fn()

  let off = store.on("test", fn1)
  store.on("test", fn2)

  off()

  await store.set("test", false)

  expect(fn1).not.toHaveBeenCalled()
  expect(fn2).toHaveBeenCalled()
})
