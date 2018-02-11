import {
  ensureFile,
  remove,
  writeFile as write,
  writeJson,
} from "fs-extra"

import { extname } from "path"

import { lock } from "proper-lockfile"

export async function writeFile({ path, value }) {
  await ensureFile(path)
  let release = await lock(path, { retries: 1000 })

  try {
    if (value === undefined) {
      await remove(path)
    } else if (extname(path) == ".json") {
      await writeJson(path, value, { spaces: 2 })
    } else {
      await write(path, value, "utf8")
    }
  } finally {
    release()
  }
}
