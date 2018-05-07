import camelDot from "camel-dot-prop-immutable"
import dot from "dot-prop-immutable"

import { changeFn } from "./change"
import { capitalize, propSplit } from "./string"

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
    this.listenersByProps = {}
    this.state = state

    for (let op of ops) {
      this[op] = async (prop, value) =>
        await this.store({ op, prop, value })
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

    const props = propSplit(prop)
    let detectChange = changeFn({ prop })

    let payload = {
      detectChange,
      op,
      prop,
      props,
      state: this.state,
      value,
    }

    await this.dispatch("before", payload)

    const result = dot[op](this.state, prop, value)
    let prevState, state

    if (op == "get") {
      prevState = state = this.state
    } else {
      prevState = this.state
      this.state = state = result
    }

    detectChange = changeFn({
      prevState,
      prop,
      state: this.state,
    })

    payload = {
      ...payload,
      detectChange,
      prevState,
      state,
    }

    await this.dispatch("after", payload)

    if (op == "get") {
      return result
    } else {
      return this.state
    }
  }

  // Events

  addListenerByProps(props, listener) {
    this.listenersByProps[props] =
      this.listenersByProps[props] || []

    this.listenersByProps[props] = this.listenersByProps[
      props
    ].concat([listener])
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

  on(props, fn) {
    const listener = options => {
      const { detectChange } = options
      if (detectChange(props)) {
        fn(options)
      }
    }

    this.addListenerByProps(props, listener)
    this.subscribe(listener)

    return listener
  }

  off(props) {
    const listeners = this.listenersByProps[props]

    this.listenersByProps[props] = []

    for (let listener of listeners) {
      this.unsubscribe(listener)
    }

    return listeners
  }

  once(props, fn) {
    let ran = false

    const listener = options => {
      if (ran) {
        return
      }

      const { detectChange } = options

      if (detectChange(props)) {
        ran = true
        fn(options)
      }
    }

    this.addListenerByProps(props, listener)
    this.subscribe(listener)

    return listener
  }
}
