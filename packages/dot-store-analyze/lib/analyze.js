import { parseModule } from "esprima"
import glob from "glob"
import { readFile } from "fs-extra"
import { join } from "path"
import { promisify } from "util"

const globAsync = promisify(glob)
const varPropRegex = /\{([^}]+)\}/

export async function analyze({ cwd = process.cwd() }) {
  const ops = []
  const paths = await globAsync("*.js", {
    cwd,
    matchBase: true,
  })

  for (const path of paths) {
    const code = await readFile(join(cwd, path))
    const structure = parseModule(code.toString(), {
      loc: true,
    })
    const calls = await collectStoreCalls(structure)

    for (const call of calls) {
      const op = call.callee.property.name
      const { line } = call.callee.property.loc.start
      const { quasis, value } = call.arguments[0]

      let prop

      if (value) {
        prop = value
      } else {
        prop = quasis
          .map(({ value: { raw } }) => raw)
          .join("*")
      }

      prop = prop.replace(varPropRegex, "*")

      ops.push({ line, op, path, prop })
    }
  }

  return ops
}

export async function collectStoreCalls(obj, calls = []) {
  if (!obj || typeof obj !== "object") {
    return calls
  }

  const type = obj.type
  const typeMatch = type === "CallExpression"

  const callee = obj.callee
  const calleeMatch =
    callee && callee.object.name === "store"

  if (calleeMatch && typeMatch) {
    calls.push(obj)
  }

  for (const key in obj) {
    await collectStoreCalls(obj[key], calls)
  }

  return calls
}
