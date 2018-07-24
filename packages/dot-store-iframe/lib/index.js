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
export default function(key) {
  return function(store) {
    store.on(`${key}.dfp.targets`, updateDfpTargets(key))

    store.on(
      `${key}.iframes.{iframeId}.height`,
      iframeSize(key)
    )

    store.on(
      `${key}.iframes.{iframeId}.width`,
      iframeSize(key)
    )

    store.onceExists(
      `${key}.iframes.{iframeId}`,
      createDfpSlot(key)
    )

    store.onceExists(
      `${key}.iframes.{iframeId}`,
      createIframe(key)
    )

    store.on(
      `${key}.iframes.{iframeId}.refresh`,
      refreshDfpSlot(key)
    )

    store.on(
      "afterDelete",
      `${key}.iframes.{iframeId}`,
      deleteDfpSlot(key)
    )

    store.on(
      "afterDelete",
      `${key}.iframes.{iframeId}`,
      deleteIframe(key)
    )

    attachDfp({ key, store })

    return store
  }
}
