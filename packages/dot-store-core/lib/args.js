export const opEventRegex = /(before|after)(delete|get|merge|set|toggle|update)/i

export function defaultArgs(event, prop, listener) {
  if (typeof event === "function") {
    return ["afterupdate", undefined, event]
  }

  const isEvent =
    typeof event === "string" && event.match(opEventRegex)

  if (isEvent) {
    event = event.toLowerCase()
  }

  if (isEvent && listener) {
    return [event, prop, listener]
  }

  if (isEvent && prop) {
    return [event, undefined, prop]
  }

  if (isEvent && !prop) {
    return [event]
  }

  if (event && prop) {
    return ["afterupdate", event, prop]
  }

  if (event) {
    return ["afterupdate", event]
  }
}
