// Main method called from mMapSDK when it's ready
export async function main(myVR: MyVR, canvas: HTMLCanvasElement) {
  // eslint-disable-next-line no-param-reassign
  myVR.canvas = canvas || document.getElementById('gl-canvas')

  /* Initialize WebGL */
  const webglConfig = {
    stencil: true,
    depth: true,
    antialias: true,
    majorVersion: 2,
    minorVersion: 0,
  }
  if (!myVR.createContext(myVR.canvas, true, true, webglConfig)) {
    webglConfig.majorVersion = 1
    console.warn('WebGL 2 not supported, attempting to use WebGL 1')
    if (!myVR.createContext(myVR.canvas, true, true, webglConfig)) {
      console.error('Failed to create at WebGL context, aborting')
      return null
    }
  }
  myVR.Browser.createContext(myVR.canvas, true, true, webglConfig)
  return myVR
}
