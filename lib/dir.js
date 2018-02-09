import dot from "dot-prop-immutable"
import { readdir } from "fs-extra"
import { extname, resolve } from "path"
import { tryLstat, tryParse, tryReadFile } from "./try"

export async function dirToObj(
  dir,
  { keys = [], map = {}, obj = {} } = {}
) {
  let dirInfo = await tryLstat(dir)

  if (!dirInfo || !dirInfo.isDirectory()) {
    return {}
  }

  let files = await readdir(dir)
  map[keys.join(".")] = { dir }

  for (let basename of files) {
    let path = resolve(dir, basename)

    let newKeys = basenameToKeys({
      basename,
      keys,
    })

    if (!newKeys) {
      continue
    }

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

    if (parseStr) {
      map[query] = { json: path }
    } else {
      map[query] = { txt: path }
    }
  }

  return { map, obj }
}

export function basenameToKeys({ basename, keys }) {
  let key = basename
    .replace(/\.[^.]+$/, "")
    .replace(/\./, "\\.")

  if (key.length == 0) {
    return
  }

  let newKeys = keys.concat([key])

  return newKeys
}

export async function keyToPath({ dir, key, files }) {
  let regex = new RegExp(`^${key}\\.`, "i")
  let match

  for (let file of files) {
    if (file.match(regex)) {
      match = resolve(dir, file)
    }
  }

  if (match) {
    let type = extname(match) == ".json" ? "json" : "txt"
    return { match, type }
  } else {
    return {
      match: resolve(dir, `${key}.json`),
      type: "json",
    }
  }
}
