import dot from "dot-prop-immutable"

import { changeFn } from "./change"
import { capitalize, propToArray } from "./string"

export const ops = [
  "delete",
  "get",
  "merge",
  "set",
  "toggle",
]

export default class DotStore {
  constructor(state = {}) {
    this.state = state

    this.listeners = {}
    this.listenersBy = {
      fn: {},
      prop: {},
    }

    for (let op of ops) {
      this[op] = async (prop, value) =>
        await this.store({ op, prop, value })
    }
  }

  getSync(prop) {
    return dot.get(this.state, prop)
  }

  async store({ op, prop, value }) {
    const props = propToArray(prop)
    let detectChange = changeFn({ props })

    let payload = {
      detectChange,
      op,
      prop,
      props,
      store: this,
      value,
    }

    await this.dispatch("before", payload)

    const result = dot[op](this.state, prop, value)
    let prevState = this.state

    if (op != "get") {
      this.state = result
    }

    detectChange = changeFn({
      prevState,
      props,
      state: this.state,
    })

    payload = {
      ...payload,
      detectChange,
      prevState,
    }

    await this.dispatch("after", payload)

    if (op == "get") {
      return result
    } else {
      return this.state
    }
  }

  // Events

  addListener({ prop, fn, listener }) {
    this.addListenerBy("fn", fn, listener)
    this.addListenerBy("prop", prop, listener)
  }

  addListenerBy(kind, key, listener) {
    if (!key || !listener) {
      return
    }

    const map = this.listenersBy[kind]

    map[key] = map[key] || []
    map[key] = map[key].concat([listener])
  }

  removeListener(options) {
    const { listener } = options
    let listeners = []

    for (let kind of ["fn", "prop"]) {
      const map = this.listenersBy[kind]
      const key = options[kind]

      map[key] = map[key] || []

      if (listener) {
        listeners = listeners.concat(
          map[key].filter(fn => fn == listener)
        )
        map[key] = map[key].filter(fn => fn != listener)
      } else {
        listeners = listeners.concat(map[key])
        map[key] = []
      }
    }

    for (let listener of new Set(listeners)) {
      this.unsubscribe(listener)
    }
  }

  removeListenerByIntersection(prop, fn) {
    const propListeners = this.listenersBy.prop[prop]
    const fnListeners = this.listenersBy.fn[fn]

    const listeners = fnListeners.filter(f =>
      propListeners.includes(f)
    )

    for (let listener of listeners) {
      this.removeListener({ fn, listener, prop })
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
        await fn({ ...payload, state: this.state })
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

    if (fn) {
      this.listeners[event] = this.listeners[event].filter(
        f => f !== fn
      )
    } else {
      this.listeners[event] = []
    }
  }

  on(prop, fn, once = false) {
    const listener = options => {
      if (once) {
        this.removeListenerByIntersection(prop, fn)
      }

      const { detectChange } = options

      if (detectChange(prop)) {
        fn(options)
      }
    }

    this.addListener({ fn, listener, prop })
    this.subscribe(listener)

    return listener
  }

  off(prop, fn) {
    if (prop && !fn) {
      this.removeListener({ prop })
    }

    if (prop && fn) {
      this.removeListenerByIntersection(prop, fn)
    }
  }

  once(prop, fn) {
    return this.on(prop, fn, true)
  }

  oncePresent(prop, fn) {
    const value = this.getSync(prop)

    if (value) {
      fn({
        prop,
        props: propToArray(prop),
        state: this.state,
        store: this,
        value,
      })
    } else {
      this.once(prop, fn)
    }
  }
}
