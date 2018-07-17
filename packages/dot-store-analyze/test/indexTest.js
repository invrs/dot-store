import { join } from "path"
import { analyze } from "../dist/analyze"

test("analyze", async () => {
  const calls = await analyze({
    cwd: join(__dirname, "fixture"),
  })
  expect(calls).toEqual({
    "*.cookies": {
      get: [
        {
          cwd: expect.any(String),
          dir: ".",
          line: 3,
          op: "get",
          path: "lib/index.js",
          prop: "*.cookies",
        },
        {
          cwd: expect.any(String),
          dir: ".",
          line: 4,
          op: "get",
          path: "lib/index.js",
          prop: "*.cookies",
        },
      ],
    },
    "cookies.*": {
      get: [
        {
          cwd: expect.any(String),
          dir: ".",
          line: 2,
          op: "get",
          path: "lib/index.js",
          prop: "cookies.*",
        },
      ],
      set: [
        {
          cwd: expect.any(String),
          dir: ".",
          line: 7,
          op: "set",
          path: "lib/index.js",
          prop: "cookies.*",
        },
      ],
    },
  })
})
