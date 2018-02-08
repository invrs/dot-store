import { lstat, readFile } from "fs-extra"

import { lock } from "proper-lockfile"

export async function tryLstat(path) {
  try {
    return await lstat(path)
  } catch (e) {
    return
  }
}

export function tryParse(str) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return
  }
}

export async function tryReadFile(path) {
  let release = await lock(path, { retries: 1000 })
  let output
  try {
    output = await readFile(path, "utf8")
  } finally {
    release()
  }
  return output
}
