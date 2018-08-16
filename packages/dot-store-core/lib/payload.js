// Packages
import dot from "@invrs/dot-prop-immutable"

// Helpers
import { buildChanged } from "./changed"

export function payload({
  change = {},
  event = {},
  meta = {},
  options = {},
  prevState = options.prevState,
  store = options.store,
  subscriber = {},
  vars = {},
  state = options.state,
}) {
  const groups = { change, event, meta, subscriber }

  for (const option in groups) {
    if (options[option]) {
      groups[option] = {
        ...options[option],
        ...groups[option],
      }
    }
  }

  ;({ change, event, meta, subscriber } = groups)

  if (typeof state === "undefined") {
    state = store.state
  }

  if (typeof change.props === "undefined") {
    change.props = change.propKeys.join(".")
  }

  if (typeof change.propKeys === "undefined") {
    change.propKeys = dot.propToArray(change.props)
  }

  if (
    typeof change.value === "undefined" &&
    event.prep !== "before"
  ) {
    change.value = store.get(change.propKeys)
  }

  if (typeof change.test !== "function") {
    change.test = buildChanged({
      change,
      event,
      mode: change.test,
      prevState,
      state,
    })
  }

  if (subscriber.props || subscriber.propKeys) {
    if (!subscriber.props) {
      subscriber.props = subscriber.propKeys.join(".")
    }

    if (!subscriber.propKeys) {
      subscriber.propKeys = dot.propToArray(
        subscriber.props
      )
    }

    if (!subscriber.prevValue && prevState) {
      subscriber.prevValue = dot.get(
        prevState,
        subscriber.propKeys
      )
    }

    subscriber.value = store.get(subscriber.propKeys)
  }

  if (!subscriber.props) {
    subscriber.value = state
  }

  return {
    change,
    event,
    meta,
    prevState,
    state,
    store,
    subscriber,
    ...vars,
  }
}

export function existsPayload(options) {
  const { change, store } = options
  return payload({
    change: {
      prevValue: change.value,
      test: "vars",
    },
    options,
    prevState: store.state,
  })
}
