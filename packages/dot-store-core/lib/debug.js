const hasWindow = typeof window !== "undefined"
const hasProcess = typeof process !== "undefined"
const processKeys = ["op", "value", "prev", "meta"]
const windowKeys = [...processKeys, "state", "prevState"]

const debugMode =
  !hasWindow && hasProcess
    ? process.env.STORE_DEBUG
    : hasWindow
      ? window.location &&
        /[?&]store_debug=1/.test(window.location.search)
      : false

export function debug(store) {
  const args =
    debugMode && hasWindow ? [window.location.host] : []

  const keys =
    debugMode && hasWindow ? windowKeys : processKeys

  store.on(options => {
    const { prop } = options
    // eslint-disable-next-line no-console
    console.log(
      ...args,
      prop + "\n ",
      buildObject(options, keys)
    )
  })

  if (debugMode) {
    store.time("debugMode")
  }
}

export function buildObject(obj, keys) {
  return keys.reduce((memo, item) => {
    memo[item] = obj[item]
    return memo
  }, {})
}
