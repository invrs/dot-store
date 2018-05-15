// Variables
const elements = {}

// Iframes
export async function createIframe(options) {
  const { iframeId, prev, props, state, store } = options
  const { iframes } = state

  const iframe = iframes[iframeId]
  const { divId, url } = iframe

  if (props.length != 2 || prev || !url) {
    return
  }

  const loaded = `iframes.${iframeId}.loaded`
  const onLoad = () => store.set(loaded, true)

  const el = document.createElement("iframe")
  el.onload = onLoad

  el.frameBorder = 0
  el.src = url

  document.getElementById(divId).appendChild(el)
  elements[divId] = el
}

export function iframeSize(options) {
  const { iframeId, state } = options
  const { iframes } = state

  const iframe = iframes[iframeId]
  const { divId, height, width } = iframe

  const el = document.getElementById(divId).firstChild

  if (height) {
    el.height = height
  }

  if (width) {
    el.width = width
  }
}
