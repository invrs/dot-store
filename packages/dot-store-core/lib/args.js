// Packages
import dot from "@invrs/dot-prop-immutable"

// Constants
export const opEventRegex = /(before|after)(delete|get|merge|set|toggle|update)/i
import { varPropRegex } from "./changed"

// Helpers
export function parseArgs(event, prop, listener) {
  if (typeof event === "function") {
    return ["afterupdate", undefined, event]
  }

  const isEvent =
    typeof event === "string" && event.match(opEventRegex)

  if (isEvent) {
    event = event.toLowerCase()
  }

  if (isEvent && prop && listener) {
    const newEvent = eventFromProp(event, prop)
    return [newEvent, prop, listener]
  }

  if (isEvent && listener) {
    return [event, undefined, listener]
  }

  if (isEvent && prop) {
    return [event, undefined, prop]
  }

  if (isEvent && !prop) {
    return [event]
  }

  if (event && prop) {
    const newEvent = eventFromProp("afterupdate", event)
    return [newEvent, event, prop]
  }

  if (event) {
    const newEvent = eventFromProp("afterupdate", event)
    return [newEvent, event]
  }
}

function eventFromProp(event, prop) {
  const props = dot.propToArray(prop)
  const isVarProp = props[0].match(varPropRegex)

  if (isVarProp) {
    return event
  }

  return `${event}:${props[0]}`
}
