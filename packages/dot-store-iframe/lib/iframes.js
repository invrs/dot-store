// Variables
const elements = {}

// Iframes
export function createIframe(key) {
  return options => {
    const { iframeId, subscriber, store } = options

    if (subscriber.value.dfp) {
      return
    }

    const { divId, height, url, width } = subscriber.value
    const loaded = `${key}.iframes.${iframeId}.loaded`
    const onLoad = () => store.set(loaded, true)

    const el = document.createElement("iframe")
    el.onload = onLoad

    el.frameBorder = 0
    el.height = height ? height : 0
    el.width = width ? width : 0
    el.src = addDebug({ store, url })

    document.getElementById(divId).appendChild(el)
    elements[divId] = el
  }
}

export function deleteIframe(key) {
  return ({ iframeId, prevState }) => {
    const { iframes } = prevState[key]
    const iframe = iframes[iframeId]
    const valid = iframe && !iframe.dfp

    if (!valid) {
      return
    }

    const { divId } = iframe
    const el = document.getElementById(divId)

    if (el && el.parentNode) {
      el.parentNode.removeChild(el)
    }
  }
}

export function iframeSize(key) {
  return ({ iframeId, store }) => {
    const iframe = store.get(`${key}.iframes.${iframeId}`)

    if (!iframe) {
      return
    }

    const { divId, height, width } = iframe
    const el = document.getElementById(divId).firstChild

    if (!el) {
      return
    }

    if (height) {
      el.height = height
    }

    if (width) {
      el.width = width
    }
  }
}

// Helpers
export function addDebug({ store, url }) {
  if (!store.get("debugMode")) {
    return url
  }
  const separator = url.indexOf("?") < 0 ? "?" : "&"
  return url + `${separator}store_debug=1`
}
