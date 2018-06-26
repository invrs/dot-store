// Packages
import dot from "@invrs/dot-prop-immutable"

// Constants
export const opEventRegex = /^(before|after)(delete|get|merge|set|toggle|update)(:?)/i
import { varPropRegex } from "./changed"

// Helpers
export function parseArgs(args) {
  let event = "afterupdate",
    eventMatch = [undefined, "after"],
    listener,
    prop

  for (const arg of args) {
    const type = typeof arg

    if (type === "string") {
      const match = arg.match(opEventRegex)

      if (match) {
        eventMatch = match
        event = arg
      } else {
        prop = arg
      }
    } else if (type === "function") {
      listener = arg
    }
  }

  if (event && event.indexOf(":") < 0) {
    event = event.toLowerCase()
  }

  const needsProp = !eventMatch || !eventMatch[3]
  const props = prop ? dot.propToArray(prop) : []
  const key =
    event && prop && needsProp
      ? keyFromProp(event, props)
      : event

  return {
    event: eventMatch[1],
    key,
    listener,
    prop,
    props,
  }
}

function keyFromProp(event, props) {
  const isVarProp = props[0].match(varPropRegex)

  if (isVarProp) {
    return event
  }

  return `${event}:${props[0]}`
}
