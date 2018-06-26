// Dfp
import {
  attachDfp,
  createDfpSlot,
  deleteDfpSlot,
  refreshDfpSlot,
  updateDfpTargets,
} from "./dfp"

// Iframes
import {
  createIframe,
  deleteIframe,
  iframeSize,
} from "./iframes"

// Composers
export default function(store) {
  store.onceExists("iframes.{iframeId}", createIframe)
  store.onceExists("iframes.{iframeId}", createDfpSlot)

  store.on("iframes.{iframeId}.height", iframeSize)
  store.on("iframes.{iframeId}.width", iframeSize)

  store.on("dfp.targets", updateDfpTargets)
  store.on("iframes.{iframeId}.refresh", refreshDfpSlot)

  store.on(
    "afterDelete",
    "iframes.{iframeId}",
    deleteDfpSlot
  )

  store.on(
    "afterDelete",
    "iframes.{iframeId}",
    deleteIframe
  )

  attachDfp(store)

  return store
}
