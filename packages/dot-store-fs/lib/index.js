import { lockedFsRead } from "./fsRead"
import { lockedFsWrite } from "./fsWrite"

export default async function(store, options) {
  let { pattern, root } = options

  await lockedFsRead({ pattern, root, store })

  store.on("beforeUpdate", async () => {
    await lockedFsRead({ pattern, root, store })
  })

  store.on("afterUpdate", async ({ prop }) => {
    await lockedFsWrite({ prop, root, store })
  })

  return store
}
