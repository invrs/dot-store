import camelDot from "camel-dot-prop-immutable"
import dot from "dot-prop-immutable"

export const mutations = [
  "delete",
  "merge",
  "set",
  "toggle",
]

export default class GetSet {
  constructor(state) {
    this.listeners = []
    this.state = state

    for (let op of mutations) {
      this[op] = (prop, value) =>
        this.mutate(op, prop, value)
    }
  }

  dispatch(prop) {
    for (let fn of this.listeners) {
      fn(this.state, prop)
    }
  }

  get(props) {
    return camelDot.get(this.state, props)
  }

  mutate(op, prop, value) {
    let { prop: resolvedProp } = camelDot.camelDotMatch({
      obj: this.state,
      prop,
    })

    this.state = dot[op](this.state, resolvedProp, value)
    this.dispatch(prop)

    return this.state
  }

  subscribe(fn) {
    this.listeners.push(fn)
  }

  unsubscribe(fn) {
    this.listeners = this.listeners.filter(f => f !== fn)
  }
}
