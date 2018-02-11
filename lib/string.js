export function removeExt(path) {
  return path.replace(/(\.[^./]+|\/)$/, "")
}
