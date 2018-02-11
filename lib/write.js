import { extname, join } from "path"

import {
  ensureFile,
  remove,
  writeFile as write,
  writeJson,
} from "fs-extra"

import { lock } from "proper-lockfile"

import { isObject } from "./object"
import { nearestPath, pathIsDir } from "./paths"
import { removeExt } from "./string"

export function pathFromKey({ key, path, paths }) {
  path = join(path, key)

  let near = nearestPath({ path, paths })

  if (near && removeExt(near) == path) {
    return near
  } else {
    return path + ".json"
  }
}

export async function writeDir({ path, paths, value }) {
  if (!isObject(value)) {
    throw new Error(
      `Cannot set non-object value to directory ${path}`
    )
  }
  for (let key in value) {
    let keyPath = pathFromKey({ key, path, paths })
    let keyValue = value[key]

    if (pathIsDir(keyPath)) {
      await writeDir({
        path: keyPath,
        paths,
        value: keyValue,
      })
    } else {
      await writeFile({ path: keyPath, value: keyValue })
    }
  }
}

export async function writeFile({ path, value }) {
  await ensureFile(path)
  let release = await lock(path, { retries: 1000 })

  try {
    if (value === undefined) {
      await remove(path)
    } else if (extname(path) == ".json") {
      await writeJson(path, value, { spaces: 2 })
    } else {
      await write(path, value, "utf8")
    }
  } finally {
    release()
  }
}
