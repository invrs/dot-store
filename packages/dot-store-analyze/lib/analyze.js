import { join } from "path"
import { promisify } from "util"

// Packages
import { parse } from "babylon"
import glob from "glob"
import { readFile } from "fs-extra"
import groupBy from "sugar/array/groupBy"

// Constants
const globAsync = promisify(glob)
const varPropRegex = /\{([^}]+)\}/

// Helpers
export async function analyze({
  cwd = process.cwd(),
  dirs = ["."],
  pattern = "lib/**/*.js",
}) {
  const ops = []

  for (const dir of dirs) {
    const paths = await globAsync(pattern, {
      cwd: join(cwd, dir),
    })

    for (const path of paths) {
      const codePath = join(cwd, dir, path)
      const code = await readFile(codePath)

      let structure

      try {
        structure = parse(code.toString(), {
          plugins: [
            "classProperties",
            "jsx",
            "objectRestSpread",
          ],
          sourceType: "module",
        })
      } catch (e) {
        console.error(`babylon failed on ${codePath}`)
        console.error(e)
        continue
      }

      const calls = await collectStoreCalls(structure)

      for (const call of calls) {
        const op = call.callee.property.name
        const { line } = call.callee.property.loc.start

        let arg = call.arguments[0]
        let event
        let prop

        if (!arg) {
          continue
        }

        if (call.arguments[1]) {
          const { type } = call.arguments[1]
          if (
            type === "StringLiteral" ||
            type === "TemplateLiteral"
          ) {
            event = arg.value
            arg = call.arguments[1]
          }
        }

        prop = getProp(arg)

        ops.push({ cwd, dir, event, line, op, path, prop })
      }
    }
  }

  const opsByProp = groupBy(ops, ({ prop }) => prop)

  for (const key in opsByProp) {
    opsByProp[key] = groupBy(opsByProp[key], ({ op }) => op)
  }

  return opsByProp
}

export function getProp(arg) {
  const { quasis, value } = arg

  let prop

  if (!value && !quasis) {
    return
  }

  if (value) {
    prop = value
  } else {
    prop = quasis.map(({ value: { raw } }) => raw).join("*")
  }

  return prop.replace(varPropRegex, "*")
}

export async function collectStoreCalls(obj, calls = []) {
  if (!obj || typeof obj !== "object") {
    return calls
  }

  const type = obj.type
  const typeMatch = type === "CallExpression"

  const callee = obj.callee
  const calleeMatch =
    callee &&
    callee.object &&
    callee.object.name === "store"

  if (calleeMatch && typeMatch) {
    calls.push(obj)
  }

  for (const key in obj) {
    await collectStoreCalls(obj[key], calls)
  }

  return calls
}
