import { resolve } from "path"
import { lstat, readdir, readFile } from "fs-extra"

import dot from "dot-prop-immutable"
// import camelDot from "camel-dot-prop-immutable"
// import { lock } from "proper-lockfile"

export default async function(dir) {
  let obj = await dirToObj(dir)
  return obj
}

export async function dirToObj(
  dir,
  { keys = [], obj = {} } = {}
) {
  let dirInfo = await tryLstat(dir)

  if (!dirInfo || !dirInfo.isDirectory()) {
    return
  }

  let files = await readdir(dir)

  for (let basename of files) {
    let { path, newKeys } = parseBasename({
      basename,
      dir,
      keys,
    })
    let dirObj = await dirToObj(path, {
      keys: newKeys,
      obj,
    })

    if (dirObj) {
      obj = dirObj
      continue
    }

    let str = await tryReadFile(path)

    if (!str) {
      continue
    }

    let parseStr = tryParse(str)
    let query = newKeys.join(".")

    if (dot.get(obj, query)) {
      throw new Error(
        `key conflict on "${query}" when loading ${path}`
      )
    }

    obj = dot.set(obj, query, parseStr || str)
  }

  return obj
}

export function parseBasename({ basename, dir, keys }) {
  let path = resolve(dir, basename)
  let key = basename
    .replace(/\.[^.]+$/, "")
    .replace(/\./, "\\.")
  let newKeys = keys.concat([key])

  return { newKeys, path }
}

export async function tryLstat(path) {
  try {
    return await lstat(path)
  } catch (e) {
    return
  }
}

export function tryParse(str) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return
  }
}

export async function tryReadFile(path) {
  try {
    return await readFile(path, "utf8")
  } catch (e) {
    return
  }
}
