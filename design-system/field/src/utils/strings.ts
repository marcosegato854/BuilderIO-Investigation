import { compose, nth, split } from 'ramda'

export const extractTokenFromHeader = (bearer: string): string =>
  bearer.substr(7)

export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const getSectionFromPathname = compose(nth(1), split('/'))

export const eqLower = (a?: string, b?: string): boolean => {
  if (a && b) return a.toLowerCase() === b.toLowerCase()
  return false
}

export const formatSwVersion = (
  clientReleaseTag: string | undefined | null,
  serverReleaseTag: string | undefined | null,
  windowsImage: string | undefined | null,
  backendVersion: string | undefined | null,
  installerVersion: string | undefined | null
) => {
  const n = (s: string | null | undefined) => s || '--'
  return [
    `INST: ${n(installerVersion)}`,
    `FE: ${n(process.env.NX_VERSION)} (${n(clientReleaseTag)})`,
    `BE: ${n(backendVersion)} (${n(serverReleaseTag)})`,
    `WIN: ${n(windowsImage)}`,
  ].join(' - ')
}

export const underscores = (s: string) => {
  return s.replace(/ /g, '_')
}

export const filenameAndExtensionFromPath = (
  path: string
): { name: string; ext: string } => {
  const regex = /([^\\/]+)\.(\w+)/gm
  const matches = regex.exec(path)
  if (!matches) return { name: '', ext: '' }
  return { name: matches[1], ext: matches[2] }
}

export const fixWindowsPath = (windows_path: string) => {
  try {
    const regex = /\\\\/gm
    const subst = `/`
    const result = windows_path.replace(regex, subst)
    return result
  } catch (error) {
    return windows_path
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toJson = (str: string, label?: string): any => {
  try {
    return JSON.parse(str)
  } catch (error) {
    console.error(`[${label || '--'}] error parsing JSON`)
    console.error(error)
  }
  return {}
}
