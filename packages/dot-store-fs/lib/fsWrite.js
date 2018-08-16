import { join } from "path"

import dot from "@invrs/dot-prop-immutable"
import { ensureDir } from "fs-extra"
import { lock } from "proper-lockfile"

import { writeDir, writeFile } from "./fs"
import { nearestPath, pathIsDir, pathToQuery } from "./path"

export async function lockedFsWrite({
  props,
  root,
  store,
}) {
  await ensureDir(root)

  let release = await lock(root, { retries: 1000 })
  let paths = store.paths

  try {
    let { pathProp, path } = pathFromProp({
      paths,
      props,
      root,
    })

    let value = valueFromPathProp({
      pathProp,
      state: store.state,
    })

    if (pathIsDir(path)) {
      await writeDir({ path, paths, value })
    } else {
      await writeFile({ path, value })
    }
  } finally {
    release()
  }
}

export function pathFromProp({ paths, props, root }) {
  let regex = /\/[^/]+$/
  let path, pathProp

  if (Array.isArray(props)) {
    props = props.join("/")
  } else {
    props = props.split(/\./).join("/")
  }

  do {
    path = nearestPath({ path: join(root, props), paths })
    if (!props.match(regex)) {
      break
    }
    props = props.replace(regex, "")
  } while (!path)

  if (path) {
    pathProp = pathToQuery({ path, root })
  } else {
    path = root + "/"
    pathProp = ""
  }

  return { path, pathProp }
}

export function valueFromPathProp({ pathProp, state }) {
  if (pathProp == "") {
    return state
  } else {
    return dot.get(state, pathProp)
  }
}
