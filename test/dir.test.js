import { fixtures } from "fxtr"
import { dirToObj } from "../lib/dir"

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
