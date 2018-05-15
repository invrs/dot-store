// Dfp
import {
  activateDfpSlot,
  attachDfp,
  createDfpSlot,
} from "./dfp"

// Iframes
import { createIframe, iframeSize } from "./iframes"

// Composers
export default function(store) {
  store.on("iframes.{iframeId}", createDfpSlot)
  store.on("iframes.{iframeId}", createIframe)

  store.on("iframes.{iframeId}.active", activateDfpSlot)

  store.on("iframes.{iframeId}.height", iframeSize)
  store.on("iframes.{iframeId}.width", iframeSize)

  attachDfp(store)

  return store
}
