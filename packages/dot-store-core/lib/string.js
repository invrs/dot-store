export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function propToArray(prop) {
  if (Array.isArray(prop)) {
    return prop
  }

  return prop
    .split(".")
    .reduce(function(ret, el, index, list) {
      let last = index > 0 && list[index - 1]

      if (last && /(?:^|[^\\])\\$/.test(last)) {
        ret.pop()
        ret.push(last.slice(0, -1) + "." + el)
      } else {
        ret.push(el)
      }

      return ret
    }, [])
}
