import { dirToObj } from "../dist"
import { fixtures } from "fxtr"

test("dirToObj", async () => {
  let { path } = await fixtures(__dirname, "fixtures")
  expect(await dirToObj(path)).toEqual({
    bang: { buzz: { buzzValue: true } },
    fizz: { fizzValue: true },
    text: "Some text!\n",
  })
})
