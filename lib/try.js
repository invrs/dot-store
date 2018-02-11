import { lstat, readFile } from "fs-extra"

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
  let output

  try {
    output = await readFile(path, "utf8")
  } catch (e) {
    return
  }

  return output
}
