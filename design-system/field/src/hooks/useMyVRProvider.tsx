import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import mMapSDK from 'mMapSDK'
import { pipe } from 'ramda'
import { main } from 'utils/myVR/init/main'
import { MyVRFunctor } from 'utils/myVR/types'
import {
  enableDebugLogs,
  initialConfiguration,
  initScene,
  lazyRendering,
  resize,
  setCompositeWindow,
} from 'utils/myVR/init/startup'
import { destroy } from 'utils/myVR/init/destroy'
import { useSelector } from 'react-redux'
import { selectSystemInfo } from 'store/features/system/slice'
import { MapsConfig, MapsCountry } from 'store/features/system/types'

export type MyVRProvider = {
  execute: (...args: MyVRFunctor[]) => void
  dispose: () => void
}

const myVRInit = (
  canvas: HTMLCanvasElement,
  mapsConfig: MapsConfig,
  country: MapsCountry
) =>
  new Promise<MyVRProvider>((resolve, reject) => {
    try {
      mMapSDK(async (sdk: MyVR) => {
        let myVRInstance = await main(sdk, canvas)
        // define the execute function
        const execute = (...methods: MyVRFunctor[]) => {
          const filteredMethods = methods.slice(1)
          myVRInstance &&
            pipe(methods[0], ...(filteredMethods as []))(myVRInstance as MyVR)
        }
        // resize listener
        const resizeHandler = () => {
          if (!myVRInstance) {
            console.warn('[MYVR] cannot resize, missing myVR instance')
            return
          }
          if (!myVRInstance.canvas) {
            console.warn('[MYVR] cannot resize, missing canvas')
            return
          }
          resize(myVRInstance.canvas, myVRInstance)
        }
        if (myVRInstance) {
          window.addEventListener('resize', resizeHandler)
        }
        // define the dispose function
        const dispose = () => {
          console.info('[MYVR_PROVIDER] dispose')
          if (myVRInstance) destroy(myVRInstance)
          window.removeEventListener('resize', resizeHandler)
          myVRInstance = null
        }
        // always do first initialization
        execute(
          initialConfiguration,
          lazyRendering,
          enableDebugLogs, // TODO: disable
          initScene(mapsConfig, country),
          setCompositeWindow
        )
        // done
        resolve({ execute, dispose })
      })
    } catch (error) {
      reject(error)
    }
  })

/**
 * Hook that handles myVR
 * @returns [IClickableOption[], number]
 */
const useMyVRProvider = (): [
  MyVRProvider | undefined,
  Dispatch<SetStateAction<HTMLCanvasElement | undefined>>
] => {
  const [myVRProvider, setMyVRProvider] = useState<MyVRProvider>()
  const [myVRCanvas, setMyVRCanvas] = useState<HTMLCanvasElement>()
  const systemInfo = useSelector(selectSystemInfo)
  useEffect(() => {
    if (myVRCanvas && systemInfo && !myVRProvider) {
      if (!systemInfo.maps)
        throw new Error('MISSING HEREMAPS CONFIGURATION IN SYSTEM INFO')
      myVRInit(myVRCanvas, systemInfo.maps, systemInfo.countryCode)
        .then((provider) => setMyVRProvider(provider))
        .catch((e) => console.error('Error initializing myVR', e))
    } else if (myVRProvider && !myVRCanvas) {
      setMyVRProvider(undefined)
    }
    return () => {
      console.info('[MYVR] dispose')
      myVRProvider && myVRProvider.dispose()
    }
  }, [myVRCanvas, myVRProvider, systemInfo])
  return [myVRProvider, setMyVRCanvas]
}
export default useMyVRProvider
