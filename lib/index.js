import camelDot from "camel-dot-prop-immutable"
import dot from "dot-prop-immutable"

export const mutations = [
  "delete",
  "merge",
  "set",
  "toggle",
]

export default class DotStore {
  constructor(state = {}) {
    this.listeners = {}
    this.state = state

    for (let op of mutations) {
      this[op] = async (prop, value) =>
        await this.mutate(op, prop, value)
    }
  }

  defaultEvent(event, fn) {
    if (typeof event !== "string") {
      fn = event
      event = "afterMutate"
    }

    this.ensureListener(event)

    return { event, fn }
  }

  async dispatch(event, prop, state) {
    this.ensureListener(event)

    for (let fn of this.listeners[event]) {
      await fn(prop, state)
    }

    return this.state
  }

  ensureListener(event) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
  }

  get(props) {
    return camelDot.get(this.state, props)
  }

  async mutate(op, prop, value) {
    let { prop: resolvedProp } = camelDot.camelDotMatch({
      obj: this.state,
      prop,
    })

    await this.dispatch("beforeMutate", resolvedProp)

    let state = dot[op](this.state, resolvedProp, value)
    this.state = state

    return await this.dispatch(
      "afterMutate",
      resolvedProp,
      state
    )
  }

  subscribe(event, fn) {
    ;({ event, fn } = this.defaultEvent(event, fn))

    this.listeners[event].push(fn)
  }

  unsubscribe(event, fn) {
    ;({ event, fn } = this.defaultEvent(event, fn))

    this.listeners[event] = this.listeners[event].filter(
      f => f !== fn
    )
  }
}
