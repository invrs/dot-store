import { parseArgs } from "../lib/args"

test("parseArgs", async () => {
  const event = "afterSet"
  const prop = "foo.bar"
  const fn = () => {}

  expect(parseArgs([fn])).toEqual({
    event: "after",
    key: "afterupdate",
    listener: fn,
    props: [],
  })

  expect(parseArgs([event])).toEqual({
    event: "after",
    key: "afterset",
    listener: undefined,
    props: [],
  })

  expect(parseArgs([event, prop])).toEqual({
    event: "after",
    key: "afterset:foo",
    listener: undefined,
    props: ["foo", "bar"],
  })

  expect(parseArgs([event, fn])).toEqual({
    event: "after",
    key: "afterset",
    listener: expect.any(Function),
    props: [],
  })

  expect(parseArgs([prop])).toEqual({
    event: "after",
    key: "afterupdate:foo",
    listener: undefined,
    props: ["foo", "bar"],
  })

  expect(parseArgs([prop, fn])).toEqual({
    event: "after",
    key: "afterupdate:foo",
    listener: expect.any(Function),
    props: ["foo", "bar"],
  })

  expect(parseArgs([event, prop, fn])).toEqual({
    event: "after",
    key: "afterset:foo",
    listener: fn,
    props: ["foo", "bar"],
  })
})
