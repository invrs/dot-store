// Packages
import Cookies from "js-cookie"

// Composers
export default function(store) {
  store.op("fetch")
  store.on(
    "beforeFetch",
    "cookies.{cookieKey}",
    fetchCookie
  )
  store.on("cookies.{cookieKey}", updateCookie)
  return store
}

// Helpers
async function fetchCookie({ cookieKey, store }) {
  const value = store.get(`cookies.${cookieKey}`)

  if (!value) {
    await store.set(
      `cookies.${cookieKey}`,
      Cookies.getJSON(cookieKey) || {},
      { fromCookie: true }
    )
  }
}

async function updateCookie({ cookieKey, meta, store }) {
  if (meta.fromCookie) {
    return
  }

  await fetchCookie({ cookieKey, store })

  Cookies.set(cookieKey, store.get(`cookies.${cookieKey}`))
}
