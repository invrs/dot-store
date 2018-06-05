// Packages
import Cookies from "js-cookie"

// Composers
export default function(store) {
  store.on("beforeGet:cookies", getCookie)
  store.on("cookies.{cookieKey}", updateCookie)
  return store
}

// Helpers
async function getCookie({ cookieKey, store }) {
  await store.set(
    `cookies.${cookieKey}`,
    Cookies.getJSON(cookieKey)
  )
}

function updateCookie({ cookieKey, store }) {
  Cookies.set(
    cookieKey,
    store.getSync(`cookies.${cookieKey}`)
  )
}
