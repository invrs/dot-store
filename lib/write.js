import {
  ensureFile,
  readdir,
  remove,
  writeFile,
  writeJson,
} from "fs-extra"

import { lock } from "proper-lockfile"

import { keyToPath } from "./dir"

export async function write({ path, value }) {
  let { json, txt } = path
  path = json || txt

  await ensureFile(path)
  let release = await lock(path, { retries: 1000 })

  try {
    if (value === undefined) {
      await remove(path)
    } else if (json) {
      await writeJson(json, value, { spaces: 2 })
    } else if (txt) {
      await writeFile(txt, value, "utf8")
    }
  } finally {
    release()
  }
}

export async function writeDir({ path, value }) {
  let files = await readdir(path.dir)

  for (let key in value) {
    let { match, type } = await keyToPath({
      dir: path.dir,
      files,
      key,
    })

    await write({
      path: {
        [type]: match,
      },
      value: value[key],
    })
  }
}
