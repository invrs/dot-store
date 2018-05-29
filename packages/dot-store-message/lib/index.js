export default function(store, { key = "iframes" } = {}) {
  if (typeof window === "undefined") {
    return store
  }

  store.on(`${key}.{divId}`, async options => {
    const { divId, meta, op, prop, value } = options
    const valid = value && !value.dfp

    if (!valid || meta.fromWindow) {
      return
    }

    const message = { dotStore: true, op, prop, value }
    const el = document.getElementById(divId)

    const target = el
      ? el.firstChild.contentWindow
      : window.parent

    if (target) {
      target.postMessage(message, "*")
    }
  })

  window.addEventListener(
    "message",
    ({ data, origin }) => {
      if (origin == window.location.origin) {
        return
      }
      const { dotStore, op, prop, value } = data
      if (dotStore) {
        store[op](prop, value, { fromWindow: true })
      }
    },
    false
  )

  return store
}
