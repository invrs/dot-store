// Packages
import dot from "@invrs/dot-prop-immutable"

// Helpers
import { payload } from "./payload"

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
    const {
      listenProps,
      listenPrev,
      vars,
    } = changedValueVars({
      options,
      prop,
    })

    if (vars) {
      return listener(
        payload({
          ...options,
          listenPrev,
          listenProps,
          vars,
        })
      )
    }
  }
}

export function changedMatch({
  matchProps,
  options,
  vars,
}) {
  const { event, op, prevState, state, value } = options

  if (op === "get") {
    return vars
  }

  const current = dot.get(state, matchProps)

  if (event === "before" && current != value) {
    return vars
  }

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
  const { prevState } = options
  if (!prop) {
    return {
      listenPrev: prevState,
      vars: {},
    }
  }
  const { matchProps, vars } = changedVars({
    matcher: prop,
    options,
  })
  if (!vars) {
    return { vars }
  }
  return {
    listenPrev: dot.get(prevState, matchProps),
    listenProps: matchProps,
    vars: changedMatch({ matchProps, options, vars }),
  }
}
