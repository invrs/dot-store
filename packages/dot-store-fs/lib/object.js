export function isObject(obj) {
  return (
    obj &&
    typeof obj === "object" &&
    obj.constructor === Object
  )
}
