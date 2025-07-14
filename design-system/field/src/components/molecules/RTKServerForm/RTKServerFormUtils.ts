import { RtkServer } from 'store/features/rtk/types'

export const normalizeDataForClient = (data: RtkServer): RtkServer => {
  const fullServerStr = `http://${data.server || ''}`
  const pattern =
    // eslint-disable-next-line no-useless-escape
    /^((\w+):)?(\/\/((\w+)?(:(\w+))?@)?([^\/\?:]+)(:(\d+))?)?(\/?([^\/\?#][^\?#]*)?)?(\?([^#]+))?(#(\w*))?/
  const matches = fullServerStr.match(pattern) || []
  const port = matches[10] || ''
  // const protocol = matches[2] || '--'
  const domain = matches[8] || ''
  const server = `${domain}`
  return {
    ...data,
    server,
    port,
  }
}

export const normalizeDataForServer = (data: RtkServer): RtkServer => {
  const port = Number(data.port)
  const out = {
    ...data,
    server: `${data.server}:${port}`,
  }
  delete out.port
  return out
}
