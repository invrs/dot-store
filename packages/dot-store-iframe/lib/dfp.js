// Constants
const hasWindow = typeof window !== "undefined"
const hasGpt =
  hasWindow && typeof window.googletag !== "undefined"

// Variables
const sizeMaps = {}
const slots = {}

// Dfp
export function attachDfp(store) {
  if (!hasGpt) {
    return
  }

  window.googletag.cmd.push(() => {
    store.set("dfp.loaded", true)

    window.googletag
      .pubads()
      .addEventListener("slotRenderEnded", event => {
        const divId = event.slot.getSlotElementId()
        store.set(`iframes.${divId}.rendered`, true)
      })

    window.googletag
      .pubads()
      .addEventListener("slotOnload", event => {
        const divId = event.slot.getSlotElementId()
        store.set(`iframes.${divId}.loaded`, true)
      })
  })
}

export function buildSizeMap({ dfp, unit }) {
  if (sizeMaps[unit.id]) {
    return sizeMaps[unit.id]
  }

  const map = window.googletag.sizeMapping()

  for (let [i, value] of dfp.viewportMaps.entries()) {
    map.addSize([value[0], 0], unit.viewportSizes[i])
  }

  return (sizeMaps[unit.id] = map.build())
}

export async function createDfpSlot(options) {
  if (!hasGpt) {
    return
  }

  const { iframeId, prev, props, state } = options
  const { dfp, iframes } = state
  const iframe = iframes[iframeId]

  if (!iframe.dfp || props.length != 2 || prev) {
    return
  }

  const { divId } = iframe
  const { oop, path, targets, unitId } = iframe.dfp
  const unit = dfp.units[unitId]

  let slot

  if (oop) {
    slot = window.googletag.defineOutOfPageSlot(path, divId)
  } else {
    let sizeMap = buildSizeMap({ dfp, iframe, unit })

    slot = window.googletag.defineSlot(
      path,
      unit.sizes,
      divId
    )

    if (slot) {
      slot.defineSizeMapping(sizeMap)
    }

    if (slot && targets) {
      for (const key in targets) {
        slot.setTargeting(key, targets[key])
      }
    }
  }

  if (slot) {
    slot.addService(window.googletag.pubads())
    window.googletag.display(divId)
    slots[divId] = slot
  }
}

export async function destroyDfpSlot({ iframeId }) {
  if (!hasGpt) {
    return
  }

  window.googletag.destroySlots([slots[iframeId]])
  slots[iframeId] = undefined
}

export function refreshDfpSlot({ iframeId, state }) {
  const { iframes } = state
  const { divId } = iframes[iframeId]

  if (!hasGpt || !slots[divId]) {
    return
  }

  window.googletag
    .pubads()
    .refresh([slots[divId]], { changeCorrelator: false })
}

export function updateDfpTargets({ store }) {
  if (!hasGpt) {
    return
  }

  const targets = store.getSync("dfp.targets") || {}

  for (const key in targets) {
    window.googletag
      .pubads()
      .setTargeting(key, targets[key] || "")
  }
}
