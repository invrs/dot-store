// Packages
import dot from "@invrs/dot-prop-immutable"
import Emitter from "./emitter"

// Helpers
import { buildChanged, changeListener } from "./changed"
import { parseArgs } from "./args"

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
  }

  getSync(prop) {
    return dot.get(this.state, prop)
  }

  async operate({ meta, op, prop, value }) {
    const props = dot.propToArray(prop)
    const prev = this.getSync(prop)

    let payload = {
      changed: buildChanged({ props }),
      meta,
      op,
      prev,
      prop,
      props,
      store: this,
      value,
    }

    await this.emitOp("before", payload)

    const state = dot[op](this.state, prop, value)
    let prevState = this.state

    if (op != "get") {
      this.state = state
    }

    payload = {
      ...payload,
      changed: buildChanged({
        prevState,
        props,
        state,
      }),
      prevState,
    }

    await this.emitOp("after", payload)

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

    if (prop) {
      return super.on(
        event,
        changeListener({ listener, prop })
      )
    } else {
      return super.on(event, listener)
    }
  }

  async once(event, prop) {
    ;[event, prop] = parseArgs(event, prop)

    if (prop) {
      return new Promise(resolve => {
        const unsub = super.on(
          event,
          changeListener({
            listener: options => {
              resolve(options)
              unsub()
            },
            prop,
          })
        )
      })
    }

    return await super.once(event)
  }

  async onceExists(event, prop) {
    ;[event, prop] = parseArgs(event, prop)

    if (prop) {
      const props = dot.propToArray(prop)
      const value = this.getSync(props)

      if (value) {
        return {
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
    ;[event, , listener] = parseArgs(
      event,
      undefined,
      listener
    )

    super.off(event, listener)
  }
}
