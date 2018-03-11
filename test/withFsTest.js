import { fixtures } from "fxtr"
import GetSet, { withFs } from "../dist"

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
