import { parseArgs } from "../lib/args"

test("parseArgs", async () => {
  const event = "afterSet"
  const prop = "prop"
  const fn = () => {}

  expect(parseArgs(fn)).toEqual([
    "afterupdate",
    undefined,
    fn,
  ])

  expect(parseArgs(event)).toEqual(["afterset"])

  expect(parseArgs(event, fn)).toEqual([
    "afterset",
    undefined,
    fn,
  ])

  expect(parseArgs(prop)).toEqual(["afterupdate", prop])

  expect(parseArgs(prop, fn)).toEqual([
    "afterupdate",
    prop,
    fn,
  ])

  expect(parseArgs(event, prop, fn)).toEqual([
    "afterset",
    prop,
    fn,
  ])
})
