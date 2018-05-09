// Packages
import dot from "dot-prop-immutable"

// Strings
import { propToArray } from "./string"

export function changeFn(options) {
  return (...matchers) =>
    matchers.reduce((memo, matcher) => {
      let out = detectChange(matcher, options)

      if (out) {
        return { ...(memo || {}), ...out }
      } else {
        return memo
      }
    }, false)
}

export function detectChange(
  matcher,
  { props, prevState, state }
) {
  const matchProps = propToArray(matcher)
  const options = {}

  for (const [index, value] of matchProps.entries()) {
    const prop = props[index]
    const match = value.match(/\{([^}]+)\}/)

    if (match && !prop) {
      return false
    } else if (match) {
      options[match[1]] = prop
      matchProps[index] = prop
    }
  }

  const current = dot.get(state, matchProps)
  const previous = dot.get(prevState, matchProps)

  if (current != previous) {
    return options
  }

  return false
}
