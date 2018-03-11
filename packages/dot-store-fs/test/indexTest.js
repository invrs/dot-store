import { pathExists } from "fs-extra"
import { resolve } from "path"
import { fixtures } from "fxtr"

import GetSet from "../../../dist"
import withFs from "../dist"

let path, read, store

beforeEach(async () => {
  ;({ path, read } = await fixtures(__dirname, "fixtures"))
  store = new GetSet()

  await withFs(store, { pattern: "**/*", root: path })
})

test("set", async () => {
  let text = "Some more text!"
  let obj = { nested: {} }

  await store.set("text", text)
  expect(store.get("text")).toBe(text)
  expect(await read("text.txt")).toBe(text)

  await store.set("bang.buzz", obj)
  expect(store.get("bang.buzz")).toEqual(obj)
  expect(await read("bang/buzz.json")).toEqual(obj)

  await store.set("bang.buzz.nested", {
    hello: "world",
  })

  expect(store.get("bang.buzz.nested")).toEqual({
    hello: "world",
  })
})

test("set (concurrent)", async () => {
  await Promise.all([
    store.merge("fizz", { a: true }),
    store.merge("fizz", { b: true }),
    store.merge("fizz", { c: true }),
  ])

  expect(await read("fizz.json")).toEqual({
    a: true,
    b: true,
    c: true,
    fizzValue: true,
  })
})

test("set (undefined)", async () => {
  await store.set("text", undefined)
  expect(store.get("text")).toBe(undefined)
  expect(
    await pathExists(resolve(path, "text.txt"))
  ).not.toBeTruthy()
})

test("set (new prop)", async () => {
  let text = "hey"
  let obj = { whoah: true }

  await store.set("newProp", text)

  expect(store.get("newProp")).toBe(text)
  expect(await read("newProp.json")).toBe(text)

  expect(
    await pathExists(resolve(path, "newProp.json"))
  ).toBeTruthy()

  await store.set("bang.boom", obj)

  expect(store.get("bang.boom")).toEqual(obj)
  expect(await read("bang/boom.json")).toEqual(obj)

  expect(
    await pathExists(resolve(path, "bang/boom.json"))
  ).toBeTruthy()
})

test("merge", async () => {
  let bang = {
    boom: true,
    buzz: {
      buzzValue: true,
    },
  }

  await store.merge("bang", { boom: true })

  expect(store.get("bang")).toEqual(bang)
  expect(await read("bang/boom.json")).toEqual(true)

  let hello = { hello: {} }

  await store.merge("bang.buzz", hello)

  let buzz = {
    buzzValue: true,
    hello: {},
  }

  expect(store.get("bang.buzz")).toEqual(buzz)
  expect(await read("bang/buzz.json")).toEqual(buzz)

  await store.merge("bang.buzz.hello", {
    helloAgain: true,
  })

  buzz = {
    buzzValue: true,
    hello: {
      helloAgain: true,
    },
  }

  expect(store.get("bang.buzz")).toEqual(buzz)
  expect(await read("bang/buzz.json")).toEqual(buzz)
})
