// Packages
import Cookies from "js-cookie"

// Composers
export default function(store) {
  store.on("beforeGet:cookies", getCookie)
  store.on(
    "beforeUpdate",
    "cookies.{cookieKey}",
    updateCookie
  )
  return store
}

// Helpers
async function getCookie({ cookieKey, store }) {
  const value = store.getSync(`cookies.${cookieKey}`)

  if (!value) {
    await store.set(
      `cookies.${cookieKey}`,
      Cookies.getJSON(cookieKey),
      { fromCookie: true }
    )
  }
}

async function updateCookie({ cookieKey, meta, store }) {
  if (meta.fromCookie) {
    return
  }

  await getCookie({ cookieKey, store })

  Cookies.set(
    cookieKey,
    store.getSync(`cookies.${cookieKey}`)
  )
}
