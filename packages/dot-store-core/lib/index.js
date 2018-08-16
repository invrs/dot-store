// Packages
import dot from "@invrs/dot-prop-immutable"
import Emitter from "./emitter"

// Helpers
import { parseArgs } from "./args"
import { changeListener, changedValueVars } from "./changed"
import { debug } from "./debug"
import { ops } from "./ops"
import { existsPayload, payload } from "./payload"

// Classes
export default class DotStore extends Emitter {
  constructor(state = {}) {
    super()
    this.ops = ops
    this.state = state

    for (let op of ops) {
      this[op] = this.operateWrapper(op)
    }

    debug(this)
  }

  get(props) {
    if (props) {
      return dot.get(this.state, props)
    } else {
      return this.state
    }
  }

  op(...newOps) {
    for (const op of newOps) {
      if (ops.indexOf(op) < 0) {
        this.ops = this.ops.concat([op])
        this[op] = this.operateWrapper(op)
      }
    }
  }

  time(props) {
    return this.set(props, new Date().getTime())
  }

  operateWrapper(op) {
    return async (props, value, meta = {}) =>
      await this.operate({ meta, op, props, value })
  }

  async operate({ meta, op, props, value }) {
    const propKeys = dot.propToArray(props)
    const prevValue = this.get(props)

    const beforePayload = payload({
      change: {
        prevValue,
        propKeys,
        props,
        test: true,
        value,
      },
      event: { op, prep: "before" },
      meta,
      prevState: this.state,
      store: this,
    })

    await this.emitOp("before", beforePayload)

    const dotOp = ops.indexOf(op) > -1 ? op : "get"
    const state = dot[dotOp](this.state, props, value)
    const prevState = this.state

    if (dotOp !== "get") {
      this.state = state
    }

    const afterPayload = payload({
      change: {
        test: true,
      },
      event: { prep: "after" },
      options: beforePayload,
      prevState,
      state,
    })

    await this.emitOp("after", afterPayload)

    if (dotOp === "get") {
      return state
    } else {
      return this.state
    }
  }

  async emitOp(prep, options) {
    const events = this.events(prep, options)

    for (const e of events) {
      await this.emit(
        e,
        payload({
          options,
          state: this.state,
        })
      )
    }
  }

  events(prep, { change, event }) {
    const opEvents = [`${prep}${event.op}`]

    if (ops.indexOf(event.op) > -1) {
      opEvents.push(`${prep}update`)
    }

    const propEvents = opEvents.map(
      e => `${e}:${change.propKeys[0]}`
    )

    return [...opEvents, ...propEvents]
  }

  on(...args) {
    const options = parseArgs({ args, ops: this.ops })
    const { event } = options
    return super.on(event.key, changeListener(options))
  }

  async once(...args) {
    const { change, event } = parseArgs({
      args,
      ops: this.ops,
    })

    return new Promise(resolve => {
      const unsub = this.on(
        event.key,
        change.props,
        options => {
          resolve(options)
          unsub()
        }
      )

      return unsub
    })
  }

  async onceExists(...args) {
    const { change, event, subscriber } = parseArgs({
      args,
      ops: this.ops,
    })

    const fn = subscriber.fn

    const eventPayload = payload({
      change,
      event,
      store: this,
      subscriber,
    })

    if (fn) {
      if (eventPayload.change.value) {
        return await fn(existsPayload(eventPayload))
      }

      const unsub = this.on(
        event.key,
        change.props,
        async options => {
          const { subscriber, vars } = changedValueVars({
            options,
            propKeys: change.propKeys,
          })

          if (vars && subscriber.prevValue === undefined) {
            return await fn(
              payload({
                options,
                subscriber,
                vars,
              })
            )
          }
        }
      )

      return unsub
    }

    if (eventPayload.change.value) {
      return existsPayload(eventPayload)
    }

    return await this.once(event.key, change.props)
  }

  off(...args) {
    const { event, subscriber } = parseArgs({
      args,
      ops: this.ops,
    })

    super.off(event.key, subscriber.fn)
  }
}
