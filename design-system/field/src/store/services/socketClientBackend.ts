import { store } from 'store'
import { selectToken } from 'store/features/auth/slice'

export const getSocketUrl = () => {
  const { protocol, hostname } = window.location
  const wsProtocol = protocol === 'https:' ? 'wss' : 'ws'
  const port = protocol === 'https:' ? '' : '9080'
  return (
    process.env.NX_BACKEND_SOCKET_URL ||
    `${wsProtocol}://${hostname}:${port}/socket`
  )
}

export const initClient = (socketEndpoint: string,token:string) => {
  // Append token as query param if provided
  const url = new URL(`${getSocketUrl()}${socketEndpoint}`)
  url.searchParams.append('token', token)
  const socket = new WebSocket(url.toString())

  // We need to wrap the socket connection into a promise (socket returs callback)
  return new Promise((resolve, reject) => {
    socket.onopen = (e) => {
      // console.info('[open] Notifications WS Connection established')
      resolve({ socket })
    }
    socket.onclose = (event) => {
      // console.error('[close] Connection Notifications WS died')
      reject(new Error('ws:connect_failed '))
    }
    socket.onerror = (error: unknown) => {
      // console.info(`[error] Notifications WS: ${error.message}`)
      reject(new Error('ws:connect_failed '))
    }
  }).catch((error) => ({ socket, error }))
}
