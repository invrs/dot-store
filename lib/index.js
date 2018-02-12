import { ensureDir } from "fs-extra"

import camelDot from "camel-dot-prop-immutable"
import { lock } from "proper-lockfile"

import { patternToObj } from "./pattern"
import { setter } from "./setter"

export const ops = ["delete", "merge", "set", "toggle"]

export default async function(
  root,
  pattern = "**/*",
  options = {}
) {
  let obj

  await ensureDir(root)
  let release = await lock(root, { retries: 1000 })

  try {
    obj = (await patternToObj({ pattern, root })).obj
  } finally {
    release()
  }

  return await getSet({ obj, options, pattern, root })
}

export async function getSet({
  obj,
  options,
  pattern,
  root,
}) {
  obj = await preprocess({ obj, options, pattern, root })

  let get = props => {
    return camelDot.get(obj, props)
  }

  let setters = {}

  for (let op of ops) {
    setters[op] = setter({
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
