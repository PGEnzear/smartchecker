import { UAParser } from "ua-parser-js"

export function getDevice(useragent?: string) {
  if (!useragent) return undefined
  return new UAParser(useragent).getOS()?.name
}