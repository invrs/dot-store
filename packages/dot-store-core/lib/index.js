// Packages
import dot from "@invrs/dot-prop-immutable"
import Emitter from "./emitter"

// Helpers
import { parseArgs } from "./args"
import { buildChanged, changeListener } from "./changed"
import { debug } from "./debug"

// Constants
export const ops = [
  "delete",
  "get",
  "merge",
  "set",
  "toggle",
]

// Classes
export default class DotStore extends Emitter {
  constructor(state = {}) {
    super()

    this.state = state

    for (let op of ops) {
      this[op] = async (prop, value, meta = {}) =>
        await this.operate({ meta, op, prop, value })
    }

    debug(this)
  }

  getSync(prop) {
    return dot.get(this.state, prop)
  }

  time(prop) {
    return this.set(prop, new Date().getTime())
  }

  async operate({ meta, op, prop, value }) {
    const props = dot.propToArray(prop)
    const prev = this.getSync(prop)

    const beforePayload = {
      changed: buildChanged({
        op,
        props,
        state: this.state,
        value,
      }),
      meta,
      op,
      prev,
      prop,
      props,
      store: this,
      value,
    }

    await this.emitOp("before", beforePayload)

    const state = dot[op](this.state, prop, value)
    const prevState = this.state

    if (op != "get") {
      this.state = state
    }

    const afterPayload = {
      ...beforePayload,
      changed: buildChanged({
        op,
        prevState,
        props,
        state,
      }),
      prevState,
    }

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

  async onceExists(event, prop) {
    ;[event, prop] = parseArgs(event, prop)

    if (prop) {
      const props = dot.propToArray(prop)
      const value = this.getSync(props)

      if (value) {
        return {
          listenProp: prop,
          listenProps: props,
          listenValue: value,
          prev: value,
          prevState: this.state,
          prop,
          props,
          state: this.state,
          store: this,
          value,
        }
      }
    }

    return await this.once(event, prop)
  }

  off(event, listener) {
    ;[event, , listener] = parseArgs(event, listener)
    super.off(event, listener)
  }
}
