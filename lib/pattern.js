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

  for (let path of paths) {
    if (pathIsDir(path)) {
      continue
    }

    let query = pathToQuery({ path, root })
    let value = await tryReadFile(path)

    if (!query || !value) {
      continue
    }

    value = tryParse(value) || value

    checkKeyConflict({ obj, path, query })

    obj = dot.set(obj, query, value)
  }

  return { obj, paths }
}

export async function patternToPaths({ pattern, root }) {
  let fullPattern = join(root, pattern)
  return await promisify(glob)(fullPattern, { mark: true })
}
