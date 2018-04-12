import camelDot from "camel-dot-prop-immutable"
import dot from "dot-prop-immutable"

import { capitalize } from "./string"

export const ops = [
  "delete",
  "get",
  "merge",
  "set",
  "toggle",
]

export default class DotStore {
  constructor(state = {}) {
    this.listeners = {}
    this.state = state

    for (let op of ops) {
      this[op] = async (prop, value) =>
        await this.store({ op, prop, value })
    }
  }

  defaultEvent({ event, fn }) {
    if (typeof event !== "string") {
      fn = event
      event = "afterUpdate"
    }

    this.ensureListener(event)

    return { event, fn }
  }

  async dispatch(event, payload) {
    for (let e of this.events(event, payload)) {
      this.ensureListener(e)

      for (let fn of this.listeners[e]) {
        await fn(payload)
      }
    }

    return this.state
  }

  ensureListener(event) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
  }

  events(event, { op }) {
    let opEvent = `${event}${capitalize(op)}`

    if (op == "get") {
      return [opEvent]
    } else {
      return [opEvent, `${event}Update`]
    }
  }

  async store({ op, prop: ogProp, value }) {
    let { prop } = camelDot.camelDotMatch({
      obj: this.state,
      prop: ogProp,
    })

    let payload = {
      op,
      prop,
      state: this.state,
      value,
    }

    await this.dispatch("before", payload)

    let result = dot[op](this.state, prop, value)
    let state

    if (op == "get") {
      state = this.state
    } else {
      this.state = state = result
    }

    payload = { ...payload, state }

    await this.dispatch("after", payload)

    if (op == "get") {
      return result
    } else {
      return this.state
    }
  }

  subscribe(event, fn) {
    ;({ event, fn } = this.defaultEvent({ event, fn }))

    this.listeners[event].push(fn)
  }

  unsubscribe(event, fn) {
    ;({ event, fn } = this.defaultEvent({ event, fn }))

    this.listeners[event] = this.listeners[event].filter(
      f => f !== fn
    )
  }
}
