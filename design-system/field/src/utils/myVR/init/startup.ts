import { curry } from 'ramda'
import { MapsConfig, MapsCountry } from 'store/features/system/types'
import { enc } from 'utils/myVR/helpers'
import { initial2DMapConfig } from 'utils/myVR/init/configs'
import { MyVRFunctor } from 'utils/myVR/types'
import { toJson } from 'utils/strings'

export const lazyRendering: MyVRFunctor = (myVR: MyVR) => {
  // Lazy rendering.
  let RequestedRender = false
  let Resized = false
  // eslint-disable-next-line no-param-reassign
  myVR.render_request = () => {
    if (RequestedRender) return
    requestAnimationFrame(renderSdk)
    RequestedRender = true
  }
  // Gated call to render, called every time the canvas needs a redraw
  function renderSdk() {
    if (!Resized) {
      resize(myVR.canvas, myVR)
      Resized = true
    }
    RequestedRender = false
    myVR.render(myVR.ALL)
  }
  return myVR
}

export const initialConfiguration: MyVRFunctor = (myVR: MyVR) => {
  // some initialization parameters
  const initialConfig = JSON.stringify({
    continuousRendering: false,
    minGLVersion: 2,
    emscriptenWorkerPath: myVR.workerPath,
    emscriptenWorkerCount: 1, // TODO: we should ask if increasing it can help
  })

  /* mMap SDK Initalization and Configuration */
  myVR.initialize(initialConfig)
  return myVR
}

export function resize(canvas: HTMLCanvasElement, myVR: MyVR) {
  // Lookup the size the browser is displaying the canvas.
  const displayWidth = canvas.clientWidth
  const displayHeight = canvas.clientHeight

  // Check if the canvas is not the same size.
  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    // Make the canvas the same size
    // eslint-disable-next-line no-param-reassign
    canvas.width = displayWidth
    // eslint-disable-next-line no-param-reassign
    canvas.height = displayHeight
    setCompositeWindow(myVR)
  }
}

export const setCompositeWindow: MyVRFunctor = (myVR: MyVR) => {
  const cmd = {
    command: 'setCompositeWindow',
    composite: 1,
    x: 0,
    y: 0,
    width: myVR.canvas.clientWidth,
    height: myVR.canvas.clientHeight,
  }

  myVR.execute(enc(cmd))
  return myVR
}

export const initScene = curry(
  (
    mapsConfig: MapsConfig,
    mapsCountry: MapsCountry,
    myVR: MyVR
  ) => {
    myVR.execute(enc(initial2DMapConfig(mapsConfig, mapsCountry)))
    return myVR
  }
)

export const getResourceQueueLength = curry(
  (callback: (queueLength: number | null) => void, myVR: MyVR) => {
    try {
      const cmd = {
        command: 'getResourceQueueLength',
        composite: 1,
      }
      const queueLength = myVR.execute(enc(cmd))
      callback(toJson(queueLength, 'MYVR')['queue-length'])
    } catch (error) {
      callback(null)
    }
    return myVR
  }
)

export const registerGlobalCallback = curry(
  (callback: Function | null, myVR: MyVR) => {
    // here you can register your handler for mMap callbacks
    // eslint-disable-next-line no-param-reassign
    myVR.callback = callback
    return myVR
  }
)

export const enableDebugLogs = (myVR: MyVR): MyVR => {
  /** workers */
  // const { Browser } = myVR
  // for (const i in Browser.workers) {
  //   const info = Browser.workers[i]
  //   info.worker.addEventListener(
  //     'error',
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     function (evt:any) {
  //       alert(
  //         'Line #' + evt.lineno + ' - ' + evt.message + ' in ' + evt.filename
  //       )
  //     },
  //     false
  //   )
  // }
  installErrorHandlers(myVR)
  return myVR
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const workerErrorHandler = function (error: any) {
  console.error(
    '[MYVR] WORKER ERROR: in line' +
      error.lineno +
      ':' +
      error.message +
      '//' +
      error.filename,
    error
  )
}

function installErrorHandler(errorHandler: Function, myVR: MyVR) {
  const { Browser } = myVR
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Browser.workers.forEach((worker: any) =>
    worker.worker.addEventListener('error', errorHandler, false)
  )
}

function installErrorHandlers(myVR: MyVR) {
  installErrorHandler(workerErrorHandler, myVR)
}
