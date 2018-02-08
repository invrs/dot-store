import { resolve } from "path"
import {
  lstat,
  readdir,
  readFile,
  writeJson,
} from "fs-extra"

import dot from "dot-prop-immutable"
import camelDot from "camel-dot-prop-immutable"
import { lock } from "proper-lockfile"

export const ops = ["delete", "merge", "set", "toggle"]

export default getSet
async function getSet(dir, options = {}) {
  let { map, obj } = await dirToObj(dir)
  obj = await preprocess({ dir, obj, options })

  let get = props => {
    return camelDot.get(obj, props)
  }

  let setters = {}

  for (let op of ops) {
    setters[op] = setter({ dir, map, obj, op, options })
  }

  return {
    ...setters,
    get,
    obj,
  }
}

export async function dirToObj(
  dir,
  { keys = [], map = {}, obj = {} } = {}
) {
  let dirInfo = await tryLstat(dir)

  if (!dirInfo || !dirInfo.isDirectory()) {
    return {}
  }

  let files = await readdir(dir)

  for (let basename of files) {
    let { path, newKeys } = parseBasename({
      basename,
      dir,
      keys,
    })

    let { obj: dirObj } = await dirToObj(path, {
      keys: newKeys,
      map,
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
    map[query] = path
  }

  return { map, obj }
}

export function parseBasename({ basename, dir, keys }) {
  let path = resolve(dir, basename)
  let key = basename
    .replace(/\.[^.]+$/, "")
    .replace(/\./, "\\.")
  let newKeys = keys.concat([key])

  return { newKeys, path }
}

export async function preprocess({ dir, obj, options }) {
  let { preprocessor } = options
  if (preprocessor) {
    return await preprocessor({ dir, obj, options })
  }
  return obj
}

export function setter({ dir, map, obj, op, options }) {
  return async (props, value) => {
    let { prop } = camelDot.camelDotMatch({
      obj,
      prop: props,
    })
    let regex = /\.[^.]+$/

    obj = dot[op](obj, prop, value)

    do {
      if (map[prop]) {
        break
      } else {
        prop = prop.replace(regex, "")
      }
    } while (prop.match(regex))

    await write({ map, obj, prop })
    return await getSet(dir, options)
  }
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
  let release = await lock(path, { retries: 1000 })
  let output
  try {
    output = await readFile(path, "utf8")
  } finally {
    release()
  }
  return output
}

export async function write({ map, obj, prop }) {
  let release = await lock(map[prop], { retries: 1000 })
  await writeJson(map[prop], dot.get(obj, prop), "utf8")
  release()
}
