// Packages
import dot from "@invrs/dot-prop-immutable"
import Emitter from "./emitter"

// Helpers
import { parseArgs } from "./args"
import { changeListener } from "./changed"
import { debug } from "./debug"
import { existsPayload, payload } from "./payload"

// Constants
export const ops = ["delete", "merge", "set", "toggle"]

// Classes
export default class DotStore extends Emitter {
  constructor(state = {}) {
    super()
    this.state = state
    this["getAsync"] = this.operateWrapper("get")

    for (let op of ops) {
      this[op] = this.operateWrapper(op)
    }

    debug(this)
  }

  get(prop) {
    if (prop) {
      return dot.get(this.state, prop)
    } else {
      return this.state
    }
  }

  getSync(prop) {
    return this.get(prop)
  }

  time(prop) {
    return this.set(prop, new Date().getTime())
  }

  operateWrapper(op) {
    return async (prop, value, meta = {}) =>
      await this.operate({ meta, op, prop, value })
  }

  async operate({ meta, op, prop, value }) {
    const props = dot.propToArray(prop)
    const prev = this.get(prop)

    const beforePayload = payload({
      changed: true,
      meta,
      op,
      prev,
      prop,
      props,
      store: this,
      value,
    })

    await this.emitOp("before", beforePayload)

    const state = dot[op](this.state, prop, value)
    const prevState = this.state

    if (op != "get") {
      this.state = state
    }

    const afterPayload = payload({
      ...beforePayload,
      changed: true,
      prevState,
      state,
    })

    await this.emitOp("after", afterPayload)

    if (op == "get") {
      return state
    } else {
      return this.state
    }
  }

  async emitOp(event, payload) {
    const events = this.events(event, payload)

    for (const e of events) {
      await this.emit(e, {
        ...payload,
        state: this.state,
      })
    }
  }

  events(event, { op, props }) {
    const opEvents = [`${event}${op}`]

    if (op != "get") {
      opEvents.push(`${event}update`)
    }

    const propEvents = opEvents.map(e => `${e}:${props[0]}`)

    return [...opEvents, ...propEvents]
  }

  on(event, prop, listener) {
    ;[event, prop, listener] = parseArgs(
      event,
      prop,
      listener
    )

    return super.on(
      event,
      changeListener({ listener, prop })
    )
  }

  async once(event, prop) {
    ;[event, prop] = parseArgs(event, prop)

    return new Promise(resolve => {
      const unsub = this.on(event, prop, options => {
        resolve(options)
        unsub()
      })
    })
  }

  async onceExists(event, prop, listener) {
    ;[event, prop, listener] = parseArgs(
      event,
      prop,
      listener
    )

    const eventPayload = payload({ prop, store: this })

    if (listener) {
      if (eventPayload.value) {
        return await listener(existsPayload(eventPayload))
      }

      return this.on(event, prop, async options => {
        if (eventPayload.prop === options.prop) {
          return await listener(options)
        }
      })
    }

    if (eventPayload.value) {
      return existsPayload(eventPayload)
    }

    return await this.once(event, prop)
  }

  off(event, listener) {
    ;[event, , listener] = parseArgs(event, listener)
    super.off(event, listener)
  }
}
