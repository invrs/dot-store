import { parseArgs } from "../lib/args"

test("parseArgs", async () => {
  const event = "afterSet"
  const prop = "foo.bar"
  const fn = () => {}

  expect(parseArgs(fn)).toEqual([
    "afterupdate",
    undefined,
    fn,
  ])

  expect(parseArgs(event)).toEqual([
    "afterset",
    undefined,
    undefined,
  ])

  expect(parseArgs(event, prop)).toEqual([
    "afterset:foo",
    prop,
    undefined,
  ])

  expect(parseArgs(event, fn)).toEqual([
    "afterset",
    undefined,
    fn,
  ])

  expect(parseArgs(prop)).toEqual([
    "afterupdate:foo",
    prop,
    undefined,
  ])

  expect(parseArgs(prop, fn)).toEqual([
    "afterupdate:foo",
    prop,
    fn,
  ])

  expect(parseArgs(event, prop, fn)).toEqual([
    "afterset:foo",
    prop,
    fn,
  ])
})
