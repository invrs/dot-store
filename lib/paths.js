export function nearestPath({ path, paths }) {
  paths = paths.sort((a, b) => a.length - b.length)
  return paths.find(p => p.slice(0, path.length) == path)
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
