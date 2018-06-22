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
      .addEventListener("slotRenderEnded", async event => {
        const { isEmpty, size, slot } = event
        const divId = slot.getSlotElementId()
        store.set(`iframes.${divId}.rendered`, {
          divId,
          isEmpty,
          size,
        })
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
  const entries = Array.entries(dfp.viewportMaps)

  for (let [i, value] of entries) {
    map.addSize([value[0], 0], unit.viewportSizes[i])
  }

  return (sizeMaps[unit.id] = map.build())
}

export async function createDfpSlot(options) {
  const { iframeId, prev, props, state, store } = options
  const { dfp, iframes } = state

  const iframe = iframes[iframeId]
  const valid = iframe && iframe.dfp

  if (!valid || props.length != 2 || prev) {
    return
  }

  await store.onceExists("dfp.loaded")

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
  }

  if (slot && targets) {
    for (const key in targets) {
      slot.setTargeting(key, targets[key])
    }
  }

  if (slot) {
    slot.addService(window.googletag.pubads())
    window.googletag.display(divId)
    slots[divId] = slot
  }
}

export async function deleteDfpSlot({
  iframeId,
  prevState,
  store,
}) {
  const { iframes } = prevState
  const iframe = iframes[iframeId]
  const valid = iframe && iframe.dfp

  if (!valid) {
    return
  }

  await store.onceExists("dfp.loaded")

  window.googletag.destroySlots([slots[iframeId]])
  slots[iframeId] = undefined
}

export async function refreshDfpSlot({
  iframeId,
  state,
  store,
}) {
  const { iframes } = state
  const iframe = iframes[iframeId]
  const valid = iframe && iframe.dfp

  if (!valid) {
    return
  }

  const { divId } = iframes[iframeId]

  if (!slots[divId]) {
    return
  }

  await store.onceExists("dfp.loaded")

  window.googletag
    .pubads()
    .refresh([slots[divId]], { changeCorrelator: false })
}

export async function updateDfpTargets({ store }) {
  await store.onceExists("dfp.loaded")

  const targets = store.get("dfp.targets") || {}

  for (const key in targets) {
    window.googletag
      .pubads()
      .setTargeting(key, targets[key] || "")
  }
}
