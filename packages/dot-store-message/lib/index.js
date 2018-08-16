export default function(key) {
  return function(store) {
    if (typeof window === "undefined" || !key) {
      return store
    }

    store.on(key, async options => {
      const { change, event, meta, store } = options

      const ids = Object.keys(
        store.get("postMessage.targets") || {}
      )

      if (meta.fromWindow) {
        return
      }

      const message = {
        dotStore: true,
        op: event.op,
        props: change.props,
        value: change.value,
      }

      if (ids.length) {
        for (const id of ids) {
          const el = document.getElementById(id)

          if (!el || (el && !el.firstChild)) {
            continue
          }

          el.firstChild.contentWindow.postMessage(
            message,
            "*"
          )
        }
      } else if (window.parent != window) {
        window.parent.postMessage(message, "*")
      }
    })

    window.addEventListener(
      "message",
      ({ data, origin }) => {
        if (origin == window.location.origin) {
          return
        }
        const { dotStore, op, props, value } = data
        if (dotStore) {
          store[op](props, value, { fromWindow: true })
        }
      },
      false
    )

    return store
  }
}
