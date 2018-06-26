// Packages
import dot from "@invrs/dot-prop-immutable"

// Helpers
import { buildChanged } from "./changed"

export function payload({
  changed,
  event,
  listenPrev,
  listenProp,
  listenProps,
  listenValue,
  meta = {},
  op,
  prev,
  prevState,
  prop,
  store,
  vars = {},
  props = dot.propToArray(prop),
  value = store.get(props),
  state = store.state,
}) {
  if (changed === true) {
    changed = buildChanged({
      op,
      prevState,
      props,
      state,
      value,
    })
  }

  if (listenProp || listenProps) {
    if (!listenProp) {
      listenProp = listenProps.join(".")
    }

    if (!listenProps) {
      listenProps = dot.propToArray(listenProp)
    }

    if (!listenPrev && prevState) {
      listenPrev = dot.get(prevState, listenProps)
    }

    listenValue = store.get(listenProps)
  }

  if (!listenProp) {
    listenValue = state
  }

  return {
    changed,
    event,
    listenPrev,
    listenProp,
    listenProps,
    listenValue,
    meta,
    op,
    prev,
    prevState,
    prop,
    props,
    state,
    store,
    value,
    ...vars,
  }
}

export function existsPayload(options) {
  const { store, value } = options
  return payload({
    ...options,
    changed: () => true,
    prev: value,
    prevState: store.state,
  })
}
