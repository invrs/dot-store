import GetSet from "../dist"

let store

beforeEach(() => {
  store = new GetSet({ test: true })
})

test("get", async () => {
  expect(store.get("test")).toBe(true)
  expect(await store.getAsync("test")).toBe(true)
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

test("merge", async () => {
  const fn1 = jest.fn()
  store.on("obj.key", fn1)

  await store.merge("obj", { key: true })

  const payload = {
    changed: expect.any(Function),
    listenProp: "obj.key",
    listenProps: ["obj", "key"],
    listenValue: true,
    meta: expect.any(Object),
    op: "merge",
    prev: undefined,
    prevState: { test: true },
    prop: "obj",
    props: ["obj"],
    state: { obj: { key: true }, test: true },
    store: expect.any(Object),
    value: { key: true },
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(await store.getAsync("obj.key")).toBe(true)
})

test("on", async () => {
  const fn1 = jest.fn()
  const fn2 = jest.fn()
  const fn3 = jest.fn()

  store.on(fn1)
  store.on("afterSet", fn2)
  store.on("test", fn3)

  await store.set("test", false)

  const payload = {
    changed: expect.any(Function),
    listenProp: undefined,
    listenProps: undefined,
    listenValue: { test: false },
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
  expect(fn3).toHaveBeenCalledWith({
    ...payload,
    listenProp: "test",
    listenProps: ["test"],
    listenValue: false,
    meta: expect.any(Object),
    prop: "test",
    props: ["test"],
    value: false,
  })

  expect(await store.getAsync("test")).toBe(false)
})

test("on (mismatch)", async () => {
  const fn1 = jest.fn()
  const fn2 = jest.fn()

  store.on("obj.a", fn1)
  store.on("obj.b", fn2)

  await store.set("obj.a", true)

  expect(fn1).toHaveBeenCalled()
  expect(fn2).not.toHaveBeenCalled()
})

test("on (child changed)", async () => {
  const fn1 = jest.fn()

  store.on("obj.a", fn1)

  await store.set("obj.a.b", true)

  const payload = {
    changed: expect.any(Function),
    listenProp: "obj.a",
    listenProps: ["obj", "a"],
    listenValue: { b: true },
    meta: expect.any(Object),
    op: "set",
    prev: undefined,
    prevState: { test: true },
    prop: "obj.a.b",
    props: ["obj", "a", "b"],
    state: { obj: { a: { b: true } }, test: true },
    store: expect.any(Object),
    value: true,
  }

  expect(fn1).toHaveBeenCalledWith(payload)
})

test("on (child changed w/ variable)", async () => {
  const fn1 = jest.fn()

  store.on("obj.{var}", fn1)

  await store.set("obj.a.b", true)

  const payload = {
    changed: expect.any(Function),
    listenProp: "obj.a",
    listenProps: ["obj", "a"],
    listenValue: { b: true },
    meta: expect.any(Object),
    op: "set",
    prev: undefined,
    prevState: { test: true },
    prop: "obj.a.b",
    props: ["obj", "a", "b"],
    state: { obj: { a: { b: true } }, test: true },
    store: expect.any(Object),
    value: true,
    var: "a",
  }

  expect(fn1).toHaveBeenCalledWith(payload)
})

test("on beforeUpdate", async () => {
  const fn1 = jest.fn()
  const fn2 = jest.fn()
  const fn3 = jest.fn()
  const fn4 = jest.fn()

  store.on("beforeUpdate", fn1)
  store.on("beforeUpdate", "test", fn2)
  store.on("beforeUpdate", "test.hello", fn3)
  store.on("beforeUpdate", "blah", fn4)

  await store.set("test", false)

  const payload = {
    changed: expect.any(Function),
    listenProp: undefined,
    listenProps: undefined,
    listenValue: { test: true },
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
  expect(fn2).toHaveBeenCalledWith({
    ...payload,
    listenProp: "test",
    listenProps: ["test"],
    listenValue: true,
  })
  expect(fn3).toHaveBeenCalledWith({
    ...payload,
    listenProp: "test.hello",
    listenProps: ["test", "hello"],
    listenValue: undefined,
  })
  expect(fn4).not.toHaveBeenCalled()

  expect(await store.getAsync("test")).toBe(false)
})

test("on with prop var", async () => {
  const fn1 = jest.fn()

  store.on("test.{key}", fn1)

  await store.set("test.foo", false)

  const payload = {
    changed: expect.any(Function),
    key: "foo",
    listenProp: "test.foo",
    listenProps: ["test", "foo"],
    listenValue: false,
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
  expect(await store.getAsync("test.foo")).toBe(false)
})

test("on with root prop var", async () => {
  const fn1 = jest.fn()

  store.on("{key}", fn1)

  await store.set("test", false)

  const payload = {
    changed: expect.any(Function),
    key: "test",
    listenProp: "test",
    listenProps: ["test"],
    listenValue: false,
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
  expect(await store.getAsync("test")).toBe(false)
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
    listenProp: "test",
    listenProps: ["test"],
    listenValue: false,
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

test("onceExists (promise)", async () => {
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
    listenProp: "test2",
    listenProps: ["test2"],
    listenValue: true,
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
    changed: expect.any(Function),
    listenProp: "test2",
    listenProps: ["test2"],
    listenValue: true,
    meta: expect.any(Object),
    prev: true,
    prevState: { test: true, test2: true },
    prop: "test2",
    props: ["test2"],
    state: { test: true, test2: true },
    store: expect.any(Object),
    value: true,
  })
})

test("onceExists (listener)", async () => {
  const fn1 = jest.fn()
  const fn2 = jest.fn()

  store.onceExists("test2", fn1)
  await store.set("test2", true)
  store.onceExists("test2", fn2)

  const payload = {
    changed: expect.any(Function),
    listenProp: "test2",
    listenProps: ["test2"],
    listenValue: true,
    meta: expect.any(Object),
    op: "set",
    prev: undefined,
    prevState: { test: true },
    prop: "test2",
    props: ["test2"],
    state: { test: true, test2: true },
    store: expect.any(Object),
    value: true,
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(fn2).toHaveBeenCalledWith({
    ...payload,
    op: undefined,
    prev: true,
    prevState: payload.state,
  })
})

test("onceExists (listener w/ vars)", async () => {
  const fn1 = jest.fn()
  const fn2 = jest.fn()

  store.onceExists("{id}", fn1)
  await store.set("test2", true)
  store.onceExists("{id}", fn2)

  const payload = {
    changed: expect.any(Function),
    id: "test2",
    listenProp: "test2",
    listenProps: ["test2"],
    listenValue: true,
    meta: expect.any(Object),
    op: "set",
    prev: undefined,
    prevState: { test: true },
    prop: "test2",
    props: ["test2"],
    state: { test: true, test2: true },
    store: expect.any(Object),
    value: true,
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(fn2).not.toHaveBeenCalled()
})

test("off", async () => {
  const fn1 = jest.fn()
  const fn2 = jest.fn()

  const off = store.on("test", fn1)
  store.on("test", fn2)

  off()

  await store.set("test", false)

  expect(fn1).not.toHaveBeenCalled()
  expect(fn2).toHaveBeenCalled()
})
