import { pathFromProp } from "../lib/fsWrite"

test("fsWrite", () => {
  let paths = [
    "/tmp/bang/",
    "/tmp/bang/buzz.json",
    "/tmp/fizz.json",
    "/tmp/text.txt",
  ]

  let props = "fizz.hello"
  let root = "/tmp"

  let out = pathFromProp({ paths, props, root })

  expect(out).toEqual({
    path: "/tmp/fizz.json",
    pathProp: ["fizz"],
  })
})
