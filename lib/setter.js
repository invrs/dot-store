import camelDot from "camel-dot-prop-immutable"
import dot from "dot-prop-immutable"

import getSet from "."
import { write, writeDir, writeKey } from "./write"

export function setter({ dir, map, obj, op, options }) {
  return async (props, value) => {
    let { prop } = camelDot.camelDotMatch({
      obj,
      prop: props,
    })

    let mapProp = findMap({ map, prop })
    let path = map[mapProp]

    obj = dot[op](obj, prop, value)

    if (mapProp == "") {
      value = obj
    } else {
      value = dot.get(obj, mapProp)
    }

    if (path.dir) {
      let key = mapDiff({ mapProp, prop })

      if (key == "") {
        await writeDir({ path, value })
      } else {
        await writeKey({ dir: path.dir, key, value })
      }
    } else {
      await write({ path, value })
    }

    return await getSet(dir, options)
  }
}

export function findMap({ map, prop }) {
  let regex = /\.[^.]+$/

  do {
    if (map[prop]) {
      break
    } else {
      prop = prop.replace(regex, "")
    }
  } while (prop.match(regex))

  if (map[prop]) {
    return prop
  } else {
    return ""
  }
}

export function mapDiff({ mapProp, prop }) {
  return prop.replace(mapProp, "").replace(/\..+/, "")
}
