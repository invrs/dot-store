import camelDot from "camel-dot-prop-immutable"

import { patternToObj } from "./files"
import { setter } from "./setter"

export const ops = ["delete", "merge", "set", "toggle"]

export default async function(root, pattern, options = {}) {
  let { obj } = await patternToObj({ pattern, root })
  obj = await preprocess({ obj, options, pattern, root })

  let get = props => {
    return camelDot.get(obj, props)
  }

  let setters = {}

  for (let op of ops) {
    setters[op] = setter({
      obj,
      op,
      options,
      pattern,
      root,
    })
  }

  return {
    ...setters,
    get,
    obj,
  }
}

export async function preprocess({
  obj,
  options,
  pattern,
  root,
}) {
  let { preprocessor } = options
  if (preprocessor) {
    return await preprocessor({
      obj,
      options,
      pattern,
      root,
    })
  }
  return obj
}
