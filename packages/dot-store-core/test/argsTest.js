import { defaultArgs } from "../lib/args"

test("defaultArgs", async () => {
  const event = "afterSet"
  const prop = "prop"
  const fn = () => {}

  expect(defaultArgs(fn)).toEqual([
    "afterupdate",
    undefined,
    fn,
  ])
  expect(defaultArgs(event)).toEqual(["afterset"])
  expect(defaultArgs(event, fn)).toEqual([
    "afterset",
    undefined,
    fn,
  ])
  expect(defaultArgs(prop)).toEqual(["afterupdate", prop])
  expect(defaultArgs(prop, fn)).toEqual([
    "afterupdate",
    prop,
    fn,
  ])
  expect(defaultArgs(event, prop, fn)).toEqual([
    "afterset",
    prop,
    fn,
  ])
})
