import { MyVRProvider } from 'hooks/useMyVRProvider'
import useTheme from 'hooks/useTheme'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectMapView } from 'store/features/planning/slice'
import { tilesCopyrightAction } from 'store/features/position/slice'
import { selectSystemInfo } from 'store/features/system/slice'
import { MapsCountry, TileProvider } from 'store/features/system/types'
import { getCopyright } from 'store/services/apiClientMap'
import { throttle } from 'throttle-debounce'
import {
  getCurrentCopyright,
  getCurrentCopyrightV3,
} from 'utils/here/copyright'
import { getRealZoom } from 'utils/myVR/common/zoom'

export function isV3(
  obj: CopyrightInfo[] | CopyrightResponseV3
): obj is CopyrightResponseV3 {
  return (obj as CopyrightResponseV3).copyrights !== undefined
}

const DEBOUNCE_TIME = Number(process.env.NX_COPYRIGHT_DEBOUNCE) || 1000

/**
 * Hook that handles drawing polygons
 * @returns [IClickableOption[], number]
 */
const useCopyrightInformation = (
  myVRProvider?: MyVRProvider
): [(options: CameraPositionOptions) => void] => {
  const systemInfo = useSelector(selectSystemInfo)
  const [theme] = useTheme()
  const [info, setInfo] = useState<CopyrightInfo[] | CopyrightResponseV3>()
  const dispatch = useDispatch()
  const mapView = useSelector(selectMapView)

  const mapStyle = useMemo(() => {
    return mapView === 'satellite' ? 'satellite' : theme
  }, [mapView, theme])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateCopyright = useCallback(
    throttle(DEBOUNCE_TIME, false, (options: CameraPositionOptions) => {
      if (!myVRProvider) return
      if (!info) return
      if (!systemInfo?.countryCode) return
      // get current zoom (https://drop.myvr.net/files/2021.03/56930/Documentation/json-api/json-api-general/Compositing/Composite/#getpositionforscreencoordinate)
      myVRProvider.execute(
        getRealZoom(options['target-zoom'], (realZoom) => {
          // console.info(`[COPYRIGHT] zoom is ${realZoom}`)
          const copyright = isV3(info)
            ? getCurrentCopyrightV3(info, options, realZoom, mapStyle)
            : getCurrentCopyright(info, options, realZoom)
          // const copyright = getCopyrightFunc(info, options, realZoom) || null
          console.info(`[COPYRIGHT] foound ${copyright?.label}`)
          // update the store
          dispatch(tilesCopyrightAction(copyright || null))
        })
      )
    }),
    [myVRProvider, info, mapStyle, dispatch]
  )

  /**
   * set map copyright
   */
  useEffect(() => {
    if (!systemInfo) return
    if (!systemInfo.maps)
      throw new Error('MISSING HEREMAPS CONFIGURATION IN SYSTEM INFO')
    if (systemInfo.maps.tileProvider !== TileProvider.HEREMAPS) return
    getCopyright(mapStyle, systemInfo.maps, systemInfo.countryCode)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((response: any) => {
        console.info('[COPYRIGHT] copyright data loaded')
        const countryInfo =
          systemInfo.countryCode === MapsCountry.JAPAN
            ? response.data
            : response.data.carnav
        setInfo(countryInfo)
      })
      .catch((e) => {
        console.error(e)
      })
  }, [systemInfo, theme, mapStyle])
  return [updateCopyright]
}
export default useCopyrightInformation
