import camelDot from "camel-dot-prop-immutable"

import { dirToObj } from "./dir"
import { setter } from "./setter"

export const ops = ["delete", "merge", "set", "toggle"]

export default async function(dir, options = {}) {
  let { map, obj } = await dirToObj(dir)
  obj = await preprocess({ dir, obj, options })

  let get = props => {
    return camelDot.get(obj, props)
  }

  let setters = {}

  for (let op of ops) {
    setters[op] = setter({ dir, map, obj, op, options })
  }

  return {
    ...setters,
    get,
    obj,
  }
}

export async function preprocess({ dir, obj, options }) {
  let { preprocessor } = options
  if (preprocessor) {
    return await preprocessor({ dir, obj, options })
  }
  return obj
}
