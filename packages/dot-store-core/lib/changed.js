// Packages
import dot from "@invrs/dot-prop-immutable"

// Constants
export const varPropRegex = /\{([^}]+)\}/

// Helpers
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

  const matchProps = dot.propToArray(matcher)
  const entries = Array.entries(matchProps)
  const vars = {}

  for (const [index, value] of entries) {
    const prop = props[index]
    const varProp = value.match(varPropRegex)

    const mismatch = !varProp && prop != value
    const needProp = varProp && !prop

    if (mismatch || needProp) {
      return false
    }

    if (varProp) {
      vars[varProp[1]] = prop
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
