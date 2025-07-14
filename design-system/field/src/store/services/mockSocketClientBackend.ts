export const getMockSocketUrl = () => {
  const { hostname } = window.location
  return process.env.NX_MOCK_SOCKET_URL || `ws://${hostname}:9000`
}

export const initMockClient = (socketEndpoint: string) => {
  const socket = new WebSocket(`${getMockSocketUrl()}${socketEndpoint}`)

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
