import { dirToObj } from "../dist"
import getSet from "../dist"
import { fixtures } from "fxtr"

test("dirToObj", async () => {
  let { path } = await fixtures(__dirname, "fixtures")
  let { obj } = await dirToObj(path)

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

  config = await config.set("bang.buzz", { hi: "hello" })
  expect(config.get("bang.buzz")).toEqual({ hi: "hello" })
})

test("merge", async () => {
  let { path } = await fixtures(__dirname, "fixtures")
  let config = await getSet(path)

  config = await config.merge("bang.buzz", { hello: true })
  expect(config.get("bang.buzz")).toEqual({
    buzzValue: true,
    hello: true,
  })

  config = await config.merge("bang.buzz", {
    helloAgain: true,
  })
  expect(config.get("bang.buzz")).toEqual({
    buzzValue: true,
    hello: true,
    helloAgain: true,
  })
})
