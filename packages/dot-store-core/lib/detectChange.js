// Packages
import dot from "dot-prop-immutable"

// Strings
import { propToArray } from "./string"

export function buildDetectChange(options) {
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

export function detectChange(matcher, options) {
  const { props, prevState, state } = options
  const matchProps = propToArray(matcher)
  const vars = {}

  for (const [index, value] of matchProps.entries()) {
    const prop = props[index]
    const match = value.match(/\{([^}]+)\}/)

    if (match && !prop) {
      return false
    } else if (match) {
      vars[match[1]] = prop
      matchProps[index] = prop
    }
  }

  const current = dot.get(state, matchProps)
  const previous = dot.get(prevState, matchProps)

  if (current != previous) {
    return vars
  }

  return false
}
