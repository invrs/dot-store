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

  detectChangeFn(change) {
    return (...props) =>
      props.some(prop => {
        if (prop.slice(-2) == ".*") {
          let regex = new RegExp(
            `^${prop.slice(0, -2)}(\\..*)?$`
          )
          return change.match(regex)
        } else {
          return change == prop
        }
      })
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

  getSync(props) {
    return camelDot.get(this.state, props)
  }

  async store({ op, prop: ogProp, value }) {
    const { prop } = camelDot.camelDotMatch({
      obj: this.state,
      prop: ogProp,
    })

    const detectChange = this.detectChangeFn(prop)

    let payload = {
      detectChange,
      op,
      prop,
      state: this.state,
      value,
    }

    await this.dispatch("before", payload)

    const result = dot[op](this.state, prop, value)
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
