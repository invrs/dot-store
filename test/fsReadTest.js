import { fixtures } from "fxtr"
import { fsRead } from "../lib/fsRead"

test("fsRead", async () => {
  let { path } = await fixtures(__dirname, "fixtures")

  let { obj } = await fsRead({
    pattern: "**/*",
    root: path,
  })

  expect(obj).toEqual({
    bang: { buzz: { buzzValue: true } },
    fizz: { fizzValue: true },
    text: "Some text!\n",
  })
})
