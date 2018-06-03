// Packages
import dot from "@invrs/dot-prop-immutable"

// Constants
export const opEventRegex = /^(before|after)(delete|get|merge|set|toggle|update)(:?)/i
import { varPropRegex } from "./changed"

// Helpers
export function parseArgs(...args) {
  let event = "afterupdate",
    eventMatch,
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

  if (event) {
    event = event.toLowerCase()
  }

  const needsProp = !eventMatch || !eventMatch[3]

  if (event && prop && needsProp) {
    event = eventFromProp(event, prop)
  }

  return [event, prop, listener]
}

function eventFromProp(event, prop) {
  const props = dot.propToArray(prop)
  const isVarProp = props[0].match(varPropRegex)

  if (isVarProp) {
    return event
  }

  return `${event}:${props[0]}`
}
