import DotStore from "../dist"

let store

beforeEach(() => {
  store = new DotStore({ test: true })
})

test("get", async () => {
  expect(store.get("test")).toBe(true)
  expect(store.get("test")).toBe(true)
})

test("change.test", async () => {
  expect.assertions(5)

  store.on(({ change }) => {
    expect(change.test("nested")).toEqual({})
    expect(change.test("nested.{key}")).toEqual({
      key: "value",
    })
    expect(change.test("nested.value.test")).toEqual({})
    expect(change.test("nested.{key1}.{key2}")).toEqual({
      key1: "value",
      key2: "test",
    })
    expect(change.test("nested.value.test.test2")).toBe(
      false
    )
  })

  await store.set("nested.value.test", true)
})

test("changed nested key", async () => {
  expect.assertions(2)

  await store.set("nested", {})

  store.on(({ change }) => {
    expect(change.test("nested.value.key")).toEqual({})
    expect(change.test("nested.value.key2")).toEqual(false)
  })

  await store.set("nested.value", { key: true })
})

test("changed equality", async () => {
  await store.set("nested.value.test", true)

  expect.assertions(4)

  store.on(({ change }) => {
    expect(change.test("nested")).toEqual({})
    expect(change.test("nested.{key}")).toEqual({
      key: "value",
    })
    expect(change.test("nested.value.test")).toBe(false)
    expect(change.test("nested.value.test.test2")).toBe(
      false
    )
  })

  await store.set("nested.value.test", true)
})

test("changed mismatch", async () => {
  expect.assertions(3)

  store.on(({ change }) => {
    expect(change.test("foo")).toEqual(false)
    expect(change.test("foo.{bar}")).toEqual(false)
    expect(change.test("nested.value.test.{bar}")).toEqual(
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
    change: {
      prevValue: undefined,
      propKeys: ["obj"],
      props: "obj",
      test: expect.any(Function),
      value: { key: true },
    },
    event: {
      op: "merge",
      prep: "after",
    },
    meta: expect.any(Object),
    prevState: { test: true },
    state: { obj: { key: true }, test: true },
    store: expect.any(Object),
    subscriber: {
      prevValue: undefined,
      propKeys: ["obj", "key"],
      props: "obj.key",
      value: true,
    },
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(store.get("obj.key")).toBe(true)
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
    change: {
      prevValue: true,
      propKeys: ["test"],
      props: "test",
      test: expect.any(Function),
      value: false,
    },
    event: { op: "set", prep: "after" },
    meta: expect.any(Object),
    prevState: { test: true },
    state: { test: false },
    store: expect.any(Object),
    subscriber: {
      prevValue: { test: true },
      value: { test: false },
    },
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(fn2).toHaveBeenCalledWith(payload)
  expect(fn3).toHaveBeenCalledWith({
    ...payload,
    meta: expect.any(Object),
    subscriber: {
      prevValue: true,
      propKeys: ["test"],
      props: "test",
      value: false,
    },
  })

  expect(store.get("test")).toBe(false)
})

test("on with mismatch", async () => {
  const fn1 = jest.fn()
  const fn2 = jest.fn()

  store.on("obj.a", fn1)
  store.on("obj.b", fn2)

  await store.set("obj.a", true)

  expect(fn1).toHaveBeenCalled()
  expect(fn2).not.toHaveBeenCalled()
})

test("on with child change", async () => {
  const fn1 = jest.fn()

  store.on("obj.a", fn1)

  await store.set("obj.a.b", true)

  const payload = {
    change: {
      prevValue: undefined,
      propKeys: ["obj", "a", "b"],
      props: "obj.a.b",
      test: expect.any(Function),
      value: true,
    },
    event: { op: "set", prep: "after" },
    meta: expect.any(Object),
    prevState: { test: true },
    state: { obj: { a: { b: true } }, test: true },
    store: expect.any(Object),
    subscriber: {
      prevValue: undefined,
      propKeys: ["obj", "a"],
      props: "obj.a",
      value: { b: true },
    },
  }

  expect(fn1).toHaveBeenCalledWith(payload)
})

test("on with child change and prop var", async () => {
  const fn1 = jest.fn()

  store.on("obj.{var}", fn1)

  await store.set("obj.a.b", true)

  const payload = {
    change: {
      prevValue: undefined,
      propKeys: ["obj", "a", "b"],
      props: "obj.a.b",
      test: expect.any(Function),
      value: true,
    },
    event: { op: "set", prep: "after" },
    meta: expect.any(Object),
    prevState: { test: true },
    state: { obj: { a: { b: true } }, test: true },
    store: expect.any(Object),
    subscriber: {
      prevValue: undefined,
      propKeys: ["obj", "a"],
      props: "obj.a",
      value: { b: true },
    },
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
    change: {
      prevValue: true,
      propKeys: ["test"],
      props: "test",
      test: expect.any(Function),
      value: false,
    },
    event: { op: "set", prep: "before" },
    meta: expect.any(Object),
    prevState: { test: true },
    state: { test: true },
    store: expect.any(Object),
    subscriber: {
      prevValue: { test: true },
      value: { test: true },
    },
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(fn2).toHaveBeenCalledWith({
    ...payload,
    subscriber: {
      prevValue: true,
      propKeys: ["test"],
      props: "test",
      value: true,
    },
  })
  expect(fn3).toHaveBeenCalledWith({
    ...payload,
    subscriber: {
      prevValue: undefined,
      propKeys: ["test", "hello"],
      props: "test.hello",
      value: undefined,
    },
  })
  expect(fn4).not.toHaveBeenCalled()

  expect(store.get("test")).toBe(false)
})

test("on custom op", async () => {
  const fn1 = jest.fn()

  store.op("create")
  store.on("create", "test", fn1)
  await store.create("test")

  expect(fn1).toHaveBeenCalledWith({
    change: {
      prevValue: true,
      propKeys: ["test"],
      props: "test",
      test: expect.any(Function),
      value: true,
    },
    event: { op: "create", prep: "after" },
    meta: expect.any(Object),
    prevState: { test: true },
    state: { test: true },
    store: expect.any(Object),
    subscriber: {
      prevValue: true,
      propKeys: ["test"],
      props: "test",
      value: true,
    },
  })
})

test("on with prop var", async () => {
  const fn1 = jest.fn()

  store.on("test.{key}", fn1)

  await store.set("test.foo", false)

  const payload = {
    change: {
      prevValue: undefined,
      propKeys: ["test", "foo"],
      props: "test.foo",
      test: expect.any(Function),
      value: false,
    },
    event: { op: "set", prep: "after" },
    key: "foo",
    meta: expect.any(Object),
    prevState: { test: true },
    state: { test: { foo: false } },
    store: expect.any(Object),
    subscriber: {
      prevValue: undefined,
      propKeys: ["test", "foo"],
      props: "test.foo",
      value: false,
    },
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(store.get("test.foo")).toBe(false)
})

test("on with root prop var", async () => {
  const fn1 = jest.fn()

  store.on("{key}", fn1)

  await store.set("test", false)

  const payload = {
    change: {
      prevValue: true,
      propKeys: ["test"],
      props: "test",
      test: expect.any(Function),
      value: false,
    },
    event: { op: "set", prep: "after" },
    key: "test",
    meta: expect.any(Object),
    prevState: { test: true },
    state: { test: false },
    store: expect.any(Object),
    subscriber: {
      prevValue: true,
      propKeys: ["test"],
      props: "test",
      value: false,
    },
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(store.get("test")).toBe(false)
})

test("once", async () => {
  let payload

  const promise = store.once("test").then(options => {
    payload = options
  })

  await store.set("test", false)
  await promise

  expect(payload).toEqual({
    change: {
      prevValue: true,
      propKeys: ["test"],
      props: "test",
      test: expect.any(Function),
      value: false,
    },
    event: { op: "set", prep: "after" },
    meta: expect.any(Object),
    prevState: { test: true },
    state: { test: false },
    store: expect.any(Object),
    subscriber: {
      prevValue: true,
      propKeys: ["test"],
      props: "test",
      value: false,
    },
  })
})

test("onceExists with promise", async () => {
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
    change: {
      prevValue: undefined,
      propKeys: ["test2"],
      props: "test2",
      test: expect.any(Function),
      value: true,
    },
    event: { op: "set", prep: "after" },
    meta: expect.any(Object),
    prevState: { test: true },
    state: { test: true, test2: true },
    store: expect.any(Object),
    subscriber: {
      prevValue: undefined,
      propKeys: ["test2"],
      props: "test2",
      value: true,
    },
  })

  payload = await store.onceExists("test2")

  expect(payload).toEqual({
    change: {
      prevValue: true,
      propKeys: ["test2"],
      props: "test2",
      test: expect.any(Function),
      value: true,
    },
    event: { key: "afterupdate:test2", prep: "after" },
    meta: expect.any(Object),
    prevState: { test: true, test2: true },
    state: { test: true, test2: true },
    store: expect.any(Object),
    subscriber: {
      fn: undefined,
      value: { test: true, test2: true },
    },
  })
})

test("onceExists with listener", async () => {
  const fn1 = jest.fn()
  const fn2 = jest.fn()

  store.onceExists("test2", fn1)
  await store.set("test2", true)
  store.onceExists("test2", fn2)

  const payload = {
    change: {
      prevValue: undefined,
      propKeys: ["test2"],
      props: "test2",
      test: expect.any(Function),
      value: true,
    },
    event: { op: "set", prep: "after" },
    meta: expect.any(Object),
    prevState: { test: true },
    state: { test: true, test2: true },
    store: expect.any(Object),
    subscriber: {
      prevValue: undefined,
      propKeys: ["test2"],
      props: "test2",
      value: true,
    },
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(fn2).toHaveBeenCalledWith({
    ...payload,
    change: {
      prevValue: true,
      propKeys: ["test2"],
      props: "test2",
      test: expect.any(Function),
      value: true,
    },
    event: { key: "afterupdate:test2", prep: "after" },
    prevState: { test: true, test2: true },
    subscriber: {
      fn: expect.any(Function),
      value: { test: true, test2: true },
    },
  })
})

test("onceExists with listener and prop var", async () => {
  const fn1 = jest.fn()
  const fn2 = jest.fn()

  store.onceExists("{id}", fn1)
  await store.set("test2", true)
  store.onceExists("{id}", fn2)
  await store.set("test2", false)
  await store.set("test2", true)

  const payload = {
    change: {
      prevValue: undefined,
      propKeys: ["test2"],
      props: "test2",
      test: expect.any(Function),
      value: true,
    },
    event: { op: "set", prep: "after" },
    id: "test2",
    meta: expect.any(Object),
    prevState: { test: true },
    state: { test: true, test2: true },
    store: expect.any(Object),
    subscriber: {
      prevValue: undefined,
      propKeys: ["test2"],
      props: "test2",
      value: true,
    },
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(fn1.mock.calls.length).toBe(1)
  expect(fn2).not.toHaveBeenCalled()
})

test("onceExists with listener, prop var, and different vars", async () => {
  const fn1 = jest.fn()

  store.onceExists("{id}", fn1)
  await store.set("test2", true)
  await store.set("test3", true)

  expect(fn1.mock.calls.length).toBe(2)
})

test("onceExists with listener and child change", async () => {
  const fn1 = jest.fn()
  const fn2 = jest.fn()

  store.onceExists("test2", fn1)
  await store.set("test2.child", true)
  store.onceExists("test2", fn2)

  const payload = {
    change: {
      prevValue: undefined,
      propKeys: ["test2", "child"],
      props: "test2.child",
      test: expect.any(Function),
      value: true,
    },
    event: { op: "set", prep: "after" },
    meta: expect.any(Object),
    prevState: { test: true },
    state: { test: true, test2: { child: true } },
    store: expect.any(Object),
    subscriber: {
      prevValue: undefined,
      propKeys: ["test2"],
      props: "test2",
      value: { child: true },
    },
  }

  expect(fn1).toHaveBeenCalledWith(payload)
  expect(fn2).toHaveBeenCalledWith({
    ...payload,
    change: {
      prevValue: { child: true },
      propKeys: ["test2"],
      props: "test2",
      test: expect.any(Function),
      value: { child: true },
    },
    event: { key: "afterupdate:test2", prep: "after" },
    prevState: { test: true, test2: { child: true } },
    subscriber: {
      fn: expect.any(Function),
      value: { test: true, test2: { child: true } },
    },
  })
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
