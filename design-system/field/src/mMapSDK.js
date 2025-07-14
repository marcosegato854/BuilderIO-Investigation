// Load mMap and run main() when done
export default function load(main) {
  // Store state on the window object since it will be access in seperate script-module later
  if (!window.mMapSDKModuleURL) {
    // var mMapSDKArch = "WASM"; //Force to use WASM without pthreads
    // var mMapSDKArch = "WASMT"; //Force to use WASM with pthreads
    // if you have both versions installed and can run either
    const mMapSDKArch =
      typeof SharedArrayBuffer !== 'undefined' ? 'WASMT' : 'WASM'
    window.mMapSDKModuleURL = `/mMapSDK/${mMapSDKArch}/mMapSDK.js`
    window.mMapSDKWorkerURL = `/mMapSDK/${mMapSDKArch}/mMapSDK.worker.js`

    window.mMapSDKInit = []
    window.mMapSDKModule = []
    window.mMapSDKInitIndex = 0
  }

  // Needs to have a unique module config and main method for each new instance
  // eslint-disable-next-line no-plusplus
  const i = window.mMapSDKInitIndex++
  window.mMapSDKInit[i] = main
  window.mMapSDKModule[i] = {
    workerPath: window.mMapSDKWorkerURL,
  }

  // Write directly to HTML using a script-module tag to properly load Emscripten compiled JS and WASM file, cannot be parsed properly by reacts import machinery
  const script = document.createElement('script')
  script.type = 'module'
  script.text += 'import( window.mMapSDKModuleURL ).then( ( module ) => {\n'
  script.text += `    module.default( window.mMapSDKModule[${i}] ).then( ( mMapSDK ) => {\n`
  script.text += `        window.mMapSDKInit[${i}]( mMapSDK );\n`
  script.text += '    }); \n'
  script.text += '});\n'
  document.head.appendChild(script)
}
