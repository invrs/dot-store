import { parseArgs } from "../lib/args"
import { ops } from "../lib/ops"

test("parseArgs", async () => {
  const event = "afterSet"
  const prop = "foo.bar"
  const fn = () => {}

  expect(parseArgs({ args: [fn], ops })).toEqual({
    event: "after",
    key: "afterupdate",
    listener: fn,
    props: [],
  })

  expect(parseArgs({ args: [event], ops })).toEqual({
    event: "after",
    key: "afterset",
    listener: undefined,
    props: [],
  })

  expect(parseArgs({ args: [event, prop], ops })).toEqual({
    event: "after",
    key: "afterset:foo",
    listener: undefined,
    props: ["foo", "bar"],
  })

  expect(parseArgs({ args: [event, fn], ops })).toEqual({
    event: "after",
    key: "afterset",
    listener: expect.any(Function),
    props: [],
  })

  expect(parseArgs({ args: [prop], ops })).toEqual({
    event: "after",
    key: "afterupdate:foo",
    listener: undefined,
    props: ["foo", "bar"],
  })

  expect(parseArgs({ args: [prop, fn], ops })).toEqual({
    event: "after",
    key: "afterupdate:foo",
    listener: expect.any(Function),
    props: ["foo", "bar"],
  })

  expect(
    parseArgs({ args: [event, prop, fn], ops })
  ).toEqual({
    event: "after",
    key: "afterset:foo",
    listener: fn,
    props: ["foo", "bar"],
  })
})
