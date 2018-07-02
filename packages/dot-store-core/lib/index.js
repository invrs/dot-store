// Packages
import dot from "@invrs/dot-prop-immutable"
import Emitter from "./emitter"

// Helpers
import { parseArgs } from "./args"
import { changeListener, changedValueVars } from "./changed"
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
      prevState: this.state,
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
        event,
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

  on(...args) {
    const options = parseArgs(args)
    const { key } = options
    return super.on(key, changeListener(options))
  }

  async once(...args) {
    const { event, key, props } = parseArgs(args)

    return new Promise(resolve => {
      const unsub = this.on(key, props, options => {
        resolve({ event, ...options })
        unsub()
      })

      return unsub
    })
  }

  async onceExists(...args) {
    const { event, key, props, listener } = parseArgs(args)

    const eventPayload = payload({
      event,
      listenProps: props,
      props,
      store: this,
    })

    const { value } = eventPayload

    if (listener) {
      if (value) {
        return await listener(existsPayload(eventPayload))
      }

      const unsub = this.on(key, props, async options => {
        const {
          listenPrev,
          listenProps,
          vars,
        } = changedValueVars({
          options,
          props,
        })

        if (vars && listenPrev === undefined) {
          return await listener(
            payload({
              ...options,
              listenPrev,
              listenProps,
              vars,
            })
          )
        }
      })

      return unsub
    }

    if (value) {
      return existsPayload(eventPayload)
    }

    return await this.once(key, props)
  }

  off(...args) {
    const { key, listener } = parseArgs(args)
    super.off(key, listener)
  }
}
