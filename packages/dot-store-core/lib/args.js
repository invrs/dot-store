// Packages
import dot from "@invrs/dot-prop-immutable"

// Constants
export const opEventRegex = /^(before|after)?(\w+)(:\w+)?/i
import { varPropRegex } from "./changed"

// Helpers
export function parseArgs({ args, ops }) {
  let event = "afterupdate",
    fn,
    prep = "after",
    props

  for (const arg of args) {
    const type = typeof arg

    if (type === "string") {
      const match = arg.match(opEventRegex)

      if (matchOp({ match, ops })) {
        prep = match[1] || prep
        event = prep + match[2] + (match[3] || "")
      } else {
        props = arg
      }
    } else if (type === "function") {
      fn = arg
    } else if (type === "object") {
      props = arg
    }
  }

  if (event && event.indexOf(":") < 0) {
    event = event.toLowerCase()
  }

  const propKeys = props ? dot.propToArray(props) : []
  const key = keyFromProp(event, propKeys)

  return {
    change: {
      propKeys,
      props,
    },
    event: {
      key,
      prep,
    },
    subscriber: {
      fn,
    },
  }
}

function matchOp({ match, ops }) {
  if (!match) {
    return
  }

  const op = match[2].toLowerCase()
  return ops.indexOf(op) > -1 || op === "update"
}

function keyFromProp(event, props) {
  if (!props[0] || event.indexOf(":") > -1) {
    return event
  }

  const isVarProp = props[0].match(varPropRegex)

  if (isVarProp) {
    return event
  }

  return `${event}:${props[0]}`
}
