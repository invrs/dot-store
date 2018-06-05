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
  const { props, prevState, state, value } = options

  const matchProps = dot.propToArray(matcher)
  const entries = Array.entries(matchProps)
  const vars = {}

  for (const [index, matchProp] of entries) {
    const prop = props[index]
    const varProp = matchProp.match(varPropRegex)

    const mismatch = !varProp && prop && prop != matchProp
    const needProp = varProp && !prop

    if (mismatch || needProp) {
      return false
    }

    if (varProp) {
      vars[varProp[1]] = prop
      matchProps[index] = prop
    }
  }

  if (!prevState) {
    const current = dot.get(state, props)

    if (current != value) {
      return vars
    }

    return false
  }

  const current = dot.get(state, matchProps)
  const previous = dot.get(prevState, matchProps)

  if (current != previous) {
    return vars
  }

  return false
}

export function changeListener({ listener, prop }) {
  return options => {
    const { changed } = options
    const vars = changed(prop)

    if (vars) {
      return listener({ ...options, ...vars })
    }
  }
}
