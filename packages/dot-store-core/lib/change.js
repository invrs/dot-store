export function changeFn({ prop, prevState, state }) {
  return (...props) => {
    let match = detectPropChange({ prop, props })

    if (match && prevState) {
      return prevState[prop] != state[prop]
    }

    return match
  }
}

export function detectPropChange({ prop: change, props }) {
  return props.some(prop => {
    if (prop.slice(-2) == ".*") {
      let regex = new RegExp(
        `^${prop.slice(0, -2)}(\\..*)?$`
      )
      return change.match(regex)
    } else {
      return change == prop
    }
  })
}
