/**
 * if a URL is provided it extracts the IP
 * with no url you get the current ip in use
 */

export const getIpFromUrl = (url?: string) => {
  const newUrl = url || window.location.href
  const replaceHttp = newUrl.replace(/^https?:\/\//, '')
  const ip = replaceHttp.split('/')[0]
  return ip
}
