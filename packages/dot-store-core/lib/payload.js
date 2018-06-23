// Packages
import dot from "@invrs/dot-prop-immutable"

// Helpers
import { buildChanged } from "./changed"

export function payload({
  changed,
  meta = {},
  op,
  prev,
  prevState,
  prop,
  store,
  listenProp = undefined,
  listenProps = undefined,
  props = dot.propToArray(prop),
  value = store.get(props),
  listenValue = value,
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

  return {
    changed,
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
  }
}

export function existsPayload(options) {
  const { prop, props, store, value } = options
  return payload({
    ...options,
    changed: () => true,
    listenProp: prop,
    listenProps: props,
    prev: value,
    prevState: store.state,
  })
}
