// Packages
import dot from "@invrs/dot-prop-immutable"
import Emitter from "./emitter"

// Helpers
import { buildChanged } from "./changed"
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
        await this.store({ meta, op, prop, value })
    }
  }

  getSync(prop) {
    return dot.get(this.state, prop)
  }

  async store({ meta, op, prop, value }) {
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

  async emitOp(event, data) {
    const events = this.events(event, data)

    for (const e of events) {
      await this.emit(e, {
        ...data,
        state: this.state,
      })
    }
  }

  events(event, { op }) {
    let opEvent = `${event}${op}`

    if (op == "get") {
      return [opEvent]
    } else {
      return [opEvent, `${event}update`]
    }
  }

  listener({ listener, prop }) {
    return options => {
      const { changed } = options
      const vars = changed(prop)

      if (vars) {
        return listener({ ...options, ...vars })
      }
    }
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
        this.listener({ listener, prop })
      )
    } else {
      return super.on(event, listener)
    }
  }

  async once(event, prop) {
    ;[event, prop] = parseArgs(event, prop)

    if (prop) {
      return new Promise(resolve => {
        const unsub = this.on(event, prop, options => {
          resolve(options)
          unsub()
        })
      })
    }

    return await super.once(event)
  }

  async onceExists(event, prop) {
    ;[event, prop] = parseArgs(event, prop)

    if (prop) {
      const value = this.getSync(prop)

      if (value) {
        return {
          prev: value,
          prevState: this.state,
          prop,
          props: dot.propToArray(prop),
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
