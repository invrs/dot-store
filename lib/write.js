import { extname, join } from "path"

import {
  ensureFile,
  remove,
  writeFile as write,
  writeJson,
} from "fs-extra"

import { nearestPath, pathIsDir, removeExt } from "./paths"

export async function writeDir({ path, paths, value }) {
  if (!isObject(value)) {
    throw new Error(
      `Cannot set non-object value to directory ${path}`
    )
  }

  let promises = Object.keys(value).map(async key => {
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
  })

  await Promise.all(promises)
}

export async function writeFile({ path, value }) {
  await ensureFile(path)

  if (value === undefined) {
    await remove(path)
  } else if (extname(path) == ".json") {
    await writeJson(path, value, { spaces: 2 })
  } else {
    await write(path, value, "utf8")
  }
}

export function isObject(obj) {
  return (
    obj &&
    typeof obj === "object" &&
    obj.constructor === Object
  )
}

export function pathFromKey({ key, path, paths }) {
  path = join(path, key)

  let near = nearestPath({ path, paths })

  if (near && removeExt(near) == path) {
    return near
  } else {
    return path + ".json"
  }
}
