// Packages
import dot from "@invrs/dot-prop-immutable"

// Helpers
import { payload } from "./payload"

// Constants
import { ops } from "./ops"
export const varPropRegex = /\{([^}]+)\}/

// Helpers
export function buildChanged(options) {
  return (...args) =>
    args.reduce((memo, props) => {
      const propKeys = dot.propToArray(props)
      const out = changed({ options, propKeys })

      if (out) {
        return { ...(memo || {}), ...out }
      } else {
        return memo
      }
    }, false)
}

export function changed({ options, propKeys }) {
  const { matchProps, vars } = changedVars({
    options,
    propKeys,
  })
  if (vars) {
    return changedMatch({ matchProps, options, vars })
  } else {
    return false
  }
}

export function changeListener({
  change,
  subscriber: { fn },
}) {
  return options => {
    const { subscriber, vars } = changedValueVars({
      options,
      propKeys: change.propKeys,
    })

    if (vars) {
      return fn(
        payload({
          options,
          subscriber,
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
  const { change, event, mode, prevState, state } = options

  if (ops.indexOf(event.op) < 0 || mode === "vars") {
    return vars
  }

  const current = dot.get(state, matchProps)

  if (event.prep === "before" && current != change.value) {
    return vars
  }

  const previous = dot.get(prevState, matchProps)

  if (current != previous) {
    return vars
  }

  return false
}

export function changedVars({ propKeys, options }) {
  const matchProps = propKeys.slice()
  const entries = Array.entries(matchProps)
  const vars = {}

  for (const [index, matchProp] of entries) {
    const key = options.change.propKeys[index]
    const varProp = matchProp.match(varPropRegex)

    const mismatch = !varProp && key && key != matchProp
    const needProp = varProp && !key

    if (mismatch || needProp) {
      return { vars: false }
    }

    if (varProp) {
      vars[varProp[1]] = key
      matchProps[index] = key
    }
  }

  return { matchProps, vars }
}

export function changedValueVars({ options, propKeys }) {
  const { prevState } = options

  if (!propKeys.length) {
    return {
      subscriber: {
        prevValue: prevState,
      },
      vars: {},
    }
  }

  const { matchProps, vars } = changedVars({
    options,
    propKeys,
  })

  if (!vars) {
    return { vars }
  }

  return {
    subscriber: {
      prevValue: dot.get(prevState, matchProps),
      propKeys: matchProps,
    },
    vars: changedMatch({ matchProps, options, vars }),
  }
}
