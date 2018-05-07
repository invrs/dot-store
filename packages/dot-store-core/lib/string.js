export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function propSplit(prop) {
  return prop
    .replace(/([^\\])\./g, "$1<SPLIT>")
    .split("<SPLIT>")
}
