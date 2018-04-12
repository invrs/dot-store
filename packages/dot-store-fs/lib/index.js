import { lockedFsRead } from "./fsRead"
import { lockedFsWrite } from "./fsWrite"

export default async function(store, options) {
  let { pattern, root } = options

  await lockedFsRead({ pattern, root, store })

  store.subscribe("beforeMutate", async () => {
    await lockedFsRead({ pattern, root, store })
  })

  store.subscribe("afterMutate", async ({ prop }) => {
    await lockedFsWrite({ prop, root, store })
  })

  return store
}
