import { fixtures } from "fxtr"
import { patternToObj } from "../lib/pattern"

test("patternToObj", async () => {
  let { path } = await fixtures(__dirname, "fixtures")
  let { obj } = await patternToObj({
    pattern: "**/*",
    root: path,
  })

  expect(obj).toEqual({
    bang: { buzz: { buzzValue: true } },
    fizz: { fizzValue: true },
    text: "Some text!\n",
  })
})
