import { analyze } from "../dist/analyze"

test("analyze", async () => {
  expect(
    await analyze({ cwd: `${__dirname}/fixture` })
  ).toEqual([
    {
      line: 2,
      op: "get",
      path: "index.js",
      prop: "cookies.*",
    },
    {
      line: 3,
      op: "get",
      path: "index.js",
      prop: "*.cookies",
    },
    {
      line: 4,
      op: "get",
      path: "index.js",
      prop: "*.cookies",
    },
    {
      line: 7,
      op: "set",
      path: "index.js",
      prop: "cookies.*",
    },
  ])
})
