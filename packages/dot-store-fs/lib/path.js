import { join } from "path"
import { promisify } from "util"

import glob from "glob"

const matchEndings = [".", "/", ""]

export async function globToPaths({ pattern, root }) {
  let fullPattern = join(root, pattern)
  return await promisify(glob)(fullPattern, { mark: true })
}

export function nearestPath({ path, paths }) {
  paths = paths.sort((a, b) => a.length - b.length)
  return paths.find(
    p =>
      p.slice(0, path.length) == path &&
      matchEndings.includes(p.charAt(path.length))
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

export function pathToQuery({ path, root }) {
  let relPath = path.replace(root + "/", "")
  let noExt = removeExt(relPath)
  return noExt.split("/")
}

export function pathIsDir(path) {
  return path.slice(-1) == "/"
}

export function removeExt(path) {
  return path.replace(/(\.[^./]+|\/)$/, "")
}
