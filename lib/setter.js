import { join } from "path"

import camelDot from "camel-dot-prop-immutable"
import dot from "dot-prop-immutable"

import getSet from "."
import {
  patternToObj,
  pathIsDir,
  pathToQuery,
} from "./files"
import { isObject } from "./object"
import { removeExt } from "./string"
import { writeFile } from "./write"

export function setter({ op, options, pattern, root }) {
  return async (props, value) => {
    let { obj, paths } = await patternToObj({
      pattern,
      root,
    })

    let { prop } = camelDot.camelDotMatch({
      obj,
      prop: props,
    })

    obj = dot[op](obj, prop, value)

    let { pathProp, path } = pathFromProp({
      paths,
      prop,
      root,
    })

    if (pathProp == "") {
      value = obj
    } else {
      value = dot.get(obj, pathProp)
    }

    if (pathIsDir(path)) {
      await writeDir({ path, paths, value })
    } else {
      await writeFile({ path, value })
    }

    return await getSet(root, pattern, options)
  }
}

export async function writeDir({ path, paths, value }) {
  if (!isObject(value)) {
    throw new Error(
      `Cannot set non-object value to directory ${path}`
    )
  }
  for (let key in value) {
    let keyPath = pathFromKey({ key, path, paths })
    let keyValue = value[key]

    if (pathIsDir(keyPath)) {
      await writeDir({
        path: keyPath,
        paths,
        value: keyValue,
      })
    } else {
      await writeFile({ path: keyPath, value: keyValue })
    }
  }
}

export function nearestPath({ path, paths }) {
  paths = paths.sort((a, b) => a.length - b.length)
  return paths.find(p => p.slice(0, path.length) == path)
}

export function pathFromKey({ key, path, paths }) {
  path = join(path, key)

  let near = nearestPath({ path, paths })

  if (near && removeExt(near) == path) {
    return near
  } else {
    return path + ".json"
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
