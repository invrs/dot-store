const hasWindow = typeof window !== "undefined"
const hasProcess = typeof process !== "undefined"
const processKeys = [
  "change",
  "event",
  "meta",
  "subscriber",
]
const windowKeys = [...processKeys, "state", "prevState"]

const debugMode =
  !hasWindow && hasProcess
    ? process.env.STORE_DEBUG
    : hasWindow
      ? window.location &&
        /[?&]store_debug=1/.test(window.location.search)
      : false

export function debug(store) {
  const keys =
    debugMode && hasWindow ? windowKeys : processKeys

  if (debugMode) {
    const fn = options => {
      const {
        change: { props },
      } = options
      // eslint-disable-next-line no-console
      console.log(props + "\n ", buildObject(options, keys))
    }

    store.on(fn)
    store.time("debugMode")
  }
}

export function buildObject(obj, keys) {
  return keys.reduce((memo, item) => {
    memo[item] = obj[item]
    return memo
  }, {})
}
