import dot from "@invrs/dot-prop-immutable"

import { ensureDir } from "fs-extra"
import { lock } from "proper-lockfile"

import { globToPaths, pathIsDir, pathToQuery } from "./path"
import { tryParse, tryReadFile } from "./try"

export async function lockedFsRead({
  pattern,
  root,
  store,
}) {
  await ensureDir(root)

  let release = await lock(root, { retries: 1000 })

  try {
    let { obj, paths } = await fsRead({ pattern, root })
    store.paths = paths
    store.state = obj
  } finally {
    release()
  }
}

export async function fsRead({ pattern, root }) {
  let obj = {}
  let paths = await globToPaths({ pattern, root })

  let promises = paths.map(async path => {
    if (pathIsDir(path)) {
      return
    }

    let query = pathToQuery({ path, root })
    let value = await tryReadFile(path)

    if (!query || !value) {
      return
    }

    value = tryParse(value) || value

    checkKeyConflict({ obj, path, query })

    obj = dot.set(obj, query, value)
  })

  await Promise.all(promises)

  return { obj, paths }
}

export function checkKeyConflict({ obj, path, query }) {
  if (dot.get(obj, query)) {
    throw new Error(
      `key conflict on "${query}" when loading ${path}`
    )
  }
}
