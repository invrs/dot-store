import { pathExists } from "fs-extra"
import { resolve } from "path"
import { fixtures } from "fxtr"

import getSet from "../dist"

test("without dir", async () => {
  let config = await getSet(
    resolve(__dirname, "non-existent"),
    "**/*"
  )
  expect(config.get("hello")).toBeUndefined()
})

test("set", async () => {
  let { path } = await fixtures(__dirname, "fixtures")
  let config = await getSet(path, "**/*")

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
  let config = await getSet(path, "**/*")

  config = await config.set("text", undefined)
  expect(config.get("text")).toBe(undefined)
  expect(
    await pathExists(resolve(path, "text.txt"))
  ).not.toBeTruthy()
})

test("set (new prop)", async () => {
  let { path } = await fixtures(__dirname, "fixtures")
  let config = await getSet(path, "**/*")

  config = await config.set("newProp", "hey")
  expect(config.get("newProp")).toBe("hey")
  expect(
    await pathExists(resolve(path, "newProp.json"))
  ).toBeTruthy()

  config = await config.set("bang.boom", { whoah: true })
  expect(config.get("bang.boom")).toEqual({ whoah: true })
  expect(
    await pathExists(resolve(path, "bang/boom.json"))
  ).toBeTruthy()
})

test("merge", async () => {
  let { path } = await fixtures(__dirname, "fixtures")
  let config = await getSet(path, "**/*")

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
