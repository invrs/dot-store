import { join } from "path"

import camelDot from "camel-dot-prop-immutable"
import dot from "dot-prop-immutable"
import { lock } from "proper-lockfile"

import {
  nearestPath,
  pathIsDir,
  pathToQuery,
} from "./paths"

import getSet from "."
import { patternToObj } from "./pattern"
import { writeDir, writeFile } from "./write"

export function setter({ op, options, pattern, root }) {
  return async (props, value) => {
    let release = await lock(root, { retries: 1000 })

    try {
      let { obj, paths } = await patternToObj({
        pattern,
        root,
      })

      let { prop } = camelDot.camelDotMatch({
        obj,
        prop: props,
      })

      let { pathProp, path } = pathFromProp({
        paths,
        prop,
        root,
      })

      obj = dot[op](obj, prop, value)

      value = valueFromPathProp({ obj, pathProp })

      if (pathIsDir(path)) {
        await writeDir({ path, paths, value })
      } else {
        await writeFile({ path, value })
      }
    } finally {
      release()
    }

    return await getSet(root, pattern, options)
  }
}

export function pathFromProp({ paths, prop, root }) {
  let regex = /\/[^/]+$/
  let path, pathProp

  if (Array.isArray(prop)) {
    prop = prop.join("/")
  } else {
    prop = prop.split(/\./).join("/")
  }

  do {
    path = nearestPath({ path: join(root, prop), paths })
    prop = prop.replace(regex, "")
  } while (!path && prop.match(regex))

  if (path) {
    pathProp = pathToQuery({ path, root })
  } else {
    path = root + "/"
    pathProp = ""
  }

  return { path, pathProp }
}

export function valueFromPathProp({ obj, pathProp }) {
  if (pathProp == "") {
    return obj
  } else {
    return dot.get(obj, pathProp)
  }
}
