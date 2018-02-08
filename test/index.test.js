import { fixtures } from "fxtr"
import { resolve } from "path"

import { dirToObj } from "../lib/dir"
import { tryLstat } from "../lib/try"

import getSet from "../dist"

test("dirToObj", async () => {
  let { path } = await fixtures(__dirname, "fixtures")
  let { map, obj } = await dirToObj(path)

  expect(Object.keys(map)).toEqual([
    "",
    "bang",
    "bang.buzz",
    "fizz",
    "text",
  ])

  expect(obj).toEqual({
    bang: { buzz: { buzzValue: true } },
    fizz: { fizzValue: true },
    text: "Some text!\n",
  })
})

test("set", async () => {
  let { path } = await fixtures(__dirname, "fixtures")
  let config = await getSet(path)

  config = await config.set("text", "Some more text!")
  expect(config.get("text")).toBe("Some more text!")

  config = await config.set("bang.buzz", { nested: {} })
  expect(config.get("bang.buzz")).toEqual({ nested: {} })

  config = await config.set("bang.buzz.nested", {
    hello: "world",
  })
  expect(config.get("bang.buzz.nested")).toEqual({
    hello: "world",
  })
})

test("set (undefined)", async () => {
  let { path } = await fixtures(__dirname, "fixtures")
  let config = await getSet(path)

  config = await config.set("text", undefined)
  expect(config.get("text")).toBe(undefined)
  expect(
    await tryLstat(resolve(path, "text.txt"))
  ).toBeUndefined()
})

test("set (new prop)", async () => {
  let { path } = await fixtures(__dirname, "fixtures")
  let config = await getSet(path)

  config = await config.set("newProp", "hey")
  expect(config.get("newProp")).toBe("hey")
  expect(
    await tryLstat(resolve(path, "newProp.json"))
  ).toBeTruthy()
})

test("merge", async () => {
  let { path } = await fixtures(__dirname, "fixtures")
  let config = await getSet(path)

  config = await config.merge("bang.buzz", { hello: {} })
  expect(config.get("bang.buzz")).toEqual({
    buzzValue: true,
    hello: {},
  })

  config = await config.merge("bang.buzz.hello", {
    helloAgain: true,
  })
  expect(config.get("bang.buzz")).toEqual({
    buzzValue: true,
    hello: {
      helloAgain: true,
    },
  })
})
