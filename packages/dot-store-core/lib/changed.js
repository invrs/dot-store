// Packages
import dot from "@invrs/dot-prop-immutable"

// Constants
export const varPropRegex = /\{([^}]+)\}/

// Helpers
export function buildChanged(options) {
  return (...matchers) =>
    matchers.reduce((memo, matcher) => {
      const out = changed(matcher, options)

      if (out) {
        return { ...(memo || {}), ...out }
      } else {
        return memo
      }
    }, false)
}

export function changed(matcher, options) {
  const { matchProps, vars } = changedVars({
    matcher,
    options,
  })
  if (vars) {
    return changedMatch({ matchProps, options, vars })
  } else {
    return false
  }
}

export function changeListener({ listener, prop }) {
  return options => {
    const { value, vars } = changedValueVars({
      options,
      prop,
    })

    if (vars) {
      return listener({ ...options, ...vars, value })
    }
  }
}

export function changedMatch({
  matchProps,
  options,
  vars,
}) {
  const { op, prevState, props, state, value } = options

  if (!prevState) {
    const current = dot.get(state, props)

    if (op === "get" || current != value) {
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

export function changedVars({ matcher, options }) {
  const { props } = options
  const matchProps = dot.propToArray(matcher)
  const entries = Array.entries(matchProps)
  const vars = {}

  for (const [index, matchProp] of entries) {
    const prop = props[index]
    const varProp = matchProp.match(varPropRegex)

    const mismatch = !varProp && prop && prop != matchProp
    const needProp = varProp && !prop

    if (mismatch || needProp) {
      return { vars: false }
    }

    if (varProp) {
      vars[varProp[1]] = prop
      matchProps[index] = prop
    }
  }

  return { matchProps, vars }
}

export function changedValueVars({ options, prop }) {
  const { state } = options
  if (!prop) {
    return { value: state, vars: {} }
  }
  const { matchProps, vars } = changedVars({
    matcher: prop,
    options,
  })
  if (!vars) {
    return { value: state, vars }
  }
  return {
    value: dot.get(state, matchProps),
    vars: changedMatch({ matchProps, options, vars }),
  }
}
