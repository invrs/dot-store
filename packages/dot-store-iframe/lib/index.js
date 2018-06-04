// Dfp
import {
  attachDfp,
  createDfpSlot,
  destroyDfpSlot,
  refreshDfpSlot,
  updateDfpTargets,
} from "./dfp"

// Iframes
import { createIframe, iframeSize } from "./iframes"

// Composers
export default function(store) {
  store.on("iframes.{iframeId}", createIframe)
  store.on("iframes.{iframeId}.height", iframeSize)
  store.on("iframes.{iframeId}.width", iframeSize)

  store.on("dfp.targets", updateDfpTargets)
  store.on("iframes.{iframeId}", createDfpSlot)
  store.on("iframes.{iframeId}.refresh", refreshDfpSlot)

  store.on(
    "afterDelete",
    "iframes.{iframeId}",
    destroyDfpSlot
  )

  attachDfp(store)

  return store
}
