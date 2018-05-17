import dot from "dot-prop-immutable"
import Emitter from "./emitter"

import { buildChanged } from "./changed"
import { capitalize, propToArray } from "./string"

export const ops = [
  "delete",
  "get",
  "merge",
  "set",
  "toggle",
]

export const opEventRegex = /(before|after)(Delete|Get|Merge|Set|Toggle|Update)/

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
    const props = propToArray(prop)
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

    const result = dot[op](this.state, prop, value)
    let prevState = this.state

    if (op != "get") {
      this.state = result
    }

    payload = {
      ...payload,
      changed: buildChanged({
        prevState,
        props,
        state: this.state,
      }),
      prevState,
    }

    await this.emitOp("after", payload)

    if (op == "get") {
      return result
    } else {
      return this.state
    }
  }

  async emitOp(event, data) {
    const events = this.events(event, data)

    for (const e of events) {
      await this.emitSerial(e, {
        ...data,
        state: this.state,
      })
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

  on(event, prop, listener) {
    if (!prop && !listener) {
      ;[event, prop, listener] = [
        "afterUpdate",
        undefined,
        event,
      ]
    } else if (!listener && event.match(opEventRegex)) {
      ;[prop, listener] = [undefined, prop]
    } else if (!listener) {
      ;[event, prop, listener] = [
        "afterUpdate",
        event,
        prop,
      ]
    }

    if (prop) {
      const customListener = options => {
        const { changed } = options
        const vars = changed(prop)

        if (vars) {
          return listener({ ...options, ...vars })
        }
      }

      return super.on(event, customListener)
    } else {
      return super.on(event, listener)
    }
  }

  async once(event, prop) {
    if (!prop && !event.match(opEventRegex)) {
      ;[event, prop] = ["afterUpdate", event]
    }

    if (prop) {
      const options = await super.once(event)
      const { changed } = options
      const vars = changed(prop)

      if (vars) {
        return { ...options, ...vars }
      }

      return await this.once(event, prop)
    }

    return await super.once(event)
  }

  async onceExists(event, prop) {
    if (!prop && !event.match(opEventRegex)) {
      ;[event, prop] = ["afterUpdate", event]
    }

    if (prop) {
      const value = this.getSync(prop)

      if (value) {
        return {
          prev: value,
          prevState: this.state,
          prop,
          props: propToArray(prop),
          state: this.state,
          store: this,
          value,
        }
      }
    }

    return await this.once(event, prop)
  }

  off(event, listener) {
    if (!listener) {
      ;[event, listener] = ["afterUpdate", event]
    } else if (!event.match(opEventRegex)) {
      throw new TypeError(
        `off event must be ${opEventRegex}`
      )
    }

    super.off(event, listener)
  }
}
