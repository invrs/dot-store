import { lockedFsRead } from "./fs.read"
import { lockedFsWrite } from "./fs.write"

export async function withFs(store, options) {
  let { pattern, root } = options

  await lockedFsRead({ pattern, root, store })

  store.subscribe(async prop => {
    await lockedFsRead({ pattern, root, store })
    await lockedFsWrite({ pattern, prop, root, store })
  })

  return store
}
