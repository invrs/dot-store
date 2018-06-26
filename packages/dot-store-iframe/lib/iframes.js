// Variables
const elements = {}

// Iframes
export async function createIframe(options) {
  const { iframeId, listenValue, store } = options

  if (!listenValue.dfp) {
    return
  }

  const { divId, url } = listenValue
  const loaded = `iframes.${iframeId}.loaded`
  const onLoad = () => store.set(loaded, true)

  const el = document.createElement("iframe")
  el.onload = onLoad

  el.frameBorder = 0
  el.height = 0
  el.src = addDebug({ store, url })

  document.getElementById(divId).appendChild(el)
  elements[divId] = el
}

export async function deleteIframe({
  iframeId,
  prevState,
}) {
  const { iframes } = prevState
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

export function iframeSize(options) {
  const { iframeId, state } = options
  const { iframes } = state
  const iframe = iframes[iframeId]

  if (!iframe) {
    return
  }

  const { divId, height, width } = iframe
  const el = document.getElementById(divId).firstChild

  if (height) {
    el.height = height
  }

  if (width) {
    el.width = width
  }
}

// Helpers
export function addDebug({ store, url }) {
  if (!store.get("debugMode")) {
    return
  }
  const separator = url.indexOf("?") < 0 ? "?" : "&"
  return url + `${separator}store_debug=1`
}
