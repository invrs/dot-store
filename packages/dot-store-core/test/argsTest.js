import { parseArgs } from "../lib/args"
import { ops } from "../lib/ops"

test("parseArgs", async () => {
  const event = "afterSet"
  const prop = "foo.bar"
  const fn = () => {}

  expect(parseArgs({ args: [fn], ops })).toEqual({
    change: { propKeys: [], props: undefined },
    event: { key: "afterupdate", prep: "after" },
    subscriber: { fn: fn },
  })

  expect(parseArgs({ args: [event], ops })).toEqual({
    change: { propKeys: [], props: undefined },
    event: { key: "afterset", prep: "after" },
    subscriber: { fn: undefined },
  })

  expect(parseArgs({ args: [event, prop], ops })).toEqual({
    change: { propKeys: ["foo", "bar"], props: "foo.bar" },
    event: { key: "afterset:foo", prep: "after" },
    subscriber: { fn: undefined },
  })

  expect(parseArgs({ args: [event, fn], ops })).toEqual({
    change: { propKeys: [], props: undefined },
    event: { key: "afterset", prep: "after" },
    subscriber: { fn: fn },
  })

  expect(parseArgs({ args: [prop], ops })).toEqual({
    change: { propKeys: ["foo", "bar"], props: "foo.bar" },
    event: { key: "afterupdate:foo", prep: "after" },
    subscriber: { fn: undefined },
  })

  expect(parseArgs({ args: [prop, fn], ops })).toEqual({
    change: { propKeys: ["foo", "bar"], props: "foo.bar" },
    event: { key: "afterupdate:foo", prep: "after" },
    subscriber: { fn: fn },
  })

  expect(
    parseArgs({ args: [event, prop, fn], ops })
  ).toEqual({
    change: { propKeys: ["foo", "bar"], props: "foo.bar" },
    event: { key: "afterset:foo", prep: "after" },
    subscriber: { fn: fn },
  })
})
