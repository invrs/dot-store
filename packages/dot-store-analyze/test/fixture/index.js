export async function getCookie({ cookieKey, store }) {
  const value = store.get(`cookies.${cookieKey}`)
  const value2 = store.get(`${cookieKey}.cookies`)
  const value3 = store.get("{cookieKey}.cookies")

  if (!value) {
    await store.set(
      `cookies.${cookieKey}`,
      { value2, value3 },
      { fromCookie: true }
    )
  }
}
