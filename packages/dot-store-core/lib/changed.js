// Packages
import dot from "@invrs/dot-prop-immutable"

// Strings
import { propToArray } from "./string"

export function buildChanged(options) {
  return (...matchers) =>
    matchers.reduce((memo, matcher) => {
      let out = changed(matcher, options)

      if (out) {
        return { ...(memo || {}), ...out }
      } else {
        return memo
      }
    }, false)
}

export function changed(matcher, options) {
  const { props, prevState, state } = options
  const matchProps = propToArray(matcher)
  const entries = Array.entries(matchProps)
  const vars = {}

  for (const [index, value] of entries) {
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
