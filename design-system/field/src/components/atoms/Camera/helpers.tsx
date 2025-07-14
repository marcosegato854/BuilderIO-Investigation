import { store } from 'store'
import { selectToken } from 'store/features/auth/slice'
import { getSocketUrl } from 'store/services/socketClientBackend'

export const initSocket = (
  imageEl: HTMLImageElement,
  socketEndpoint: string,
  firstImageCallback?: Function,
  closedCallback?: Function,
  busyRef?: React.MutableRefObject<boolean>
): WebSocket => {
  // Append token as query param if provided
  //const ws = new WebSocket(`${getSocketUrl()}${socketEndpoint}`)
  const url = new URL(`${getSocketUrl()}${socketEndpoint}`)
  const token = selectToken(store.getState())
  if (token) {
    url.searchParams.append('token', token)
  }
  const ws = new WebSocket(url.toString())

  // console.log(`${getSocketUrl()}${socketEndpoint}`)

  let objectURL: string | null
  let firstImage: boolean = true

  ws.onopen = (e) => {
    console.info(`[CAMERA_SOCKET] ${socketEndpoint} Connection established`)
  }

  ws.onmessage = (msg) => {
    const blob = msg.data
    if (!blob) return
    if (busyRef?.current) return
    objectURL && URL.revokeObjectURL(objectURL)
    objectURL = URL.createObjectURL(blob)
    if (imageEl) {
      // eslint-disable-next-line no-param-reassign
      imageEl.src = objectURL
      // eslint-disable-next-line no-param-reassign
      imageEl.onload = () => {
        objectURL && URL.revokeObjectURL(objectURL)
        objectURL = null
      }
      if (firstImage) {
        firstImage = false
        firstImageCallback && firstImageCallback()
      }
    }
  }

  ws.onclose = (event) => {
    if (event.wasClean) {
      console.info(
        `[CAMERA_SOCKET] Connection ${socketEndpoint} Camera WS closed cleanly`
      )
    } else {
      // e.g. server process killed or network down
      // event.code is usually 1006 in this case
      console.warn(
        `[CAMERA_SOCKET] Connection ${socketEndpoint} Camera WS died`
      )
    }
    closedCallback && closedCallback()
  }

  ws.onerror = (error) => {
    console.error(`[CAMERA_SOCKET] Error: ${socketEndpoint}`, error)
  }

  return ws
}

export const closeWsConnection = (ws: WebSocket) => {
  console.info(`[CAMERA_SOCKET] Manually close camera socket ${ws.url}`)
  // console.info('ws before closing')
  // console.info(ws)
  ws.close(1000, 'Work complete')
  // console.info('ws after closing')
  // console.info(ws)
}
