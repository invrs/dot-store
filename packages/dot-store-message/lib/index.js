export default async function(
  store,
  { channel = "dotStore", iframe }
) {
  if (typeof window === "undefined") {
    return store
  }

  store.on("afterUpdate", async options => {
    const { op, prop, value } = options
    const message = JSON.stringify({ op, prop, value })
    const target = iframe
      ? iframe.contentWindow
      : window.parent

    target.postMessage(channel, message)
  })

  return store
}
