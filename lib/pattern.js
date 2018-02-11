import { join } from "path"
import { promisify } from "util"

import dot from "dot-prop-immutable"
import glob from "glob"

import { pathIsDir, pathToQuery } from "./paths"
import { tryParse, tryReadFile } from "./try"

export function checkKeyConflict({ obj, path, query }) {
  if (dot.get(obj, query)) {
    throw new Error(
      `key conflict on "${query}" when loading ${path}`
    )
  }
}

export async function patternToObj({ pattern, root }) {
  let obj = {}
  let paths = await patternToPaths({ pattern, root })

  let promises = paths.map(async path => {
    if (pathIsDir(path)) {
      return
    }

    let query = pathToQuery({ path, root })
    let value = await tryReadFile(path)

    if (!query || !value) {
      return
    }

    value = tryParse(value) || value

    checkKeyConflict({ obj, path, query })

    obj = dot.set(obj, query, value)
  })

  await Promise.all(promises)

  return { obj, paths }
}

export async function patternToPaths({ pattern, root }) {
  let fullPattern = join(root, pattern)
  return await promisify(glob)(fullPattern, { mark: true })
}
