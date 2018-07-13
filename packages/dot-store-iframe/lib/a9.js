export function loadA9() {
  !(function(a9, a, p, s, t, A, g) {
    if (a[a9]) {
      return
    }
    function q(c, r) {
      a[a9]._Q.push([c, r])
    }
    a[a9] = {
      _Q: [],
      fetchBids: function() {
        q("f", arguments)
      },
      init: function() {
        q("i", arguments)
      },
      setDisplayBids: function() {},
      targetingKeys: function() {
        return []
      },
    }
    A = p.createElement(s)
    A.async = !0
    A.src = t
    g = p.getElementsByTagName(s)[0]
    g.parentNode.insertBefore(A, g)
  })(
    "apstag",
    window,
    document,
    "script",
    "//c.amazon-adsystem.com/aax2/apstag.js"
  )

  window.apstag.init({
    adServer: "googletag",
    pubID: "af505046-dd26-40d4-b0b4-23b8d71fa61d",
  })
}

export function fetchA9({ divId, path, sizes }) {
  return new Promise(resolve => {
    window.apstag.fetchBids(
      {
        slots: [
          {
            sizes: sizes,
            slotID: divId,
            slotName: path,
          },
        ],
        timeout: 2e3,
      },
      () => {
        window.apstag.setDisplayBids()
        resolve()
      }
    )
  })
}
