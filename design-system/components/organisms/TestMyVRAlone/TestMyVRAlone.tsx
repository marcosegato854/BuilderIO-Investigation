/* eslint-disable @typescript-eslint/no-explicit-any */
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import AddIcon from '@mui/icons-material/Add'
import FavoriteIcon from '@mui/icons-material/Favorite'
import MapIcon from '@mui/icons-material/Map'
import RemoveIcon from '@mui/icons-material/Remove'
import RestoreIcon from '@mui/icons-material/Restore'
import mMapSDK from 'mMapSDK'
import { pipe } from 'ramda'
import React, {
  RefObject,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { MapsCountry } from 'store/features/system/types'
import { addInputHandler } from 'utils/myVR/common/input'
import { setMapMode } from 'utils/myVR/common/mapMode'
import { refreshTiles, setMapTileStyle } from 'utils/myVR/common/mapTileStyle'
import { setPosition } from 'utils/myVR/common/position'
import { destroy } from 'utils/myVR/init/destroy'
import { main } from 'utils/myVR/init/main'
import {
  initialConfiguration,
  initScene,
  lazyRendering,
  resize,
  setCompositeWindow,
} from 'utils/myVR/init/startup'
import { addPlanningLayers } from 'utils/myVR/planning/layers'
import { MapMode, MyVRFunctor } from 'utils/myVR/types'
import style from './TestMyVRAlone.module.scss'
import { addMarkerAtPosition } from 'utils/myVR/acquisition/drawing'
import { PlanningTools } from 'store/features/planning/types'

export default function TestMyVRAlone(/* props: ITestMyVRAloneProp */) {
  const canvasRef: RefObject<HTMLCanvasElement> = useRef(null)
  // const [myVRProvider, setMyVRCanvas] = useMyVRProvider()
  const [renderCanvas, setRenderCanvas] = useState<boolean>(true)
  // const [mode, setMode] = useState<MapMode>(MapMode.MAP_2D)

  useEffect(() => {
    console.info('[TEST_MY_VR_ALONE] init')
    try {
      mMapSDK(async (sdk: MyVR) => {
        if (!canvasRef.current) return
        let myVRInstance = await main(sdk, canvasRef.current)
        // define the execute function
        const execute = (...methods: MyVRFunctor[]) => {
          const filteredMethods = methods.slice(1)
          myVRInstance &&
            pipe(methods[0], ...(filteredMethods as []))(myVRInstance as MyVR)
        }
        // resize listener
        const resizeHandler = () => resize(myVRInstance!.canvas, myVRInstance!)
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
          initScene(
            {
              appKey: 's7P76OCmpNW2B9yTVscGjXk9sEnpqCcZ9LyUOxG2dcU',
              appCode: '',
              appId: '',
            },
            MapsCountry.INTERNATIONAL
          ),
          setCompositeWindow,
          addPlanningLayers('dark'),
          setMapTileStyle(
            'dark',
            {
              appKey: 's7P76OCmpNW2B9yTVscGjXk9sEnpqCcZ9LyUOxG2dcU',
              appCode: '',
              appId: '',
            },
            MapsCountry.INTERNATIONAL
          ),
          setMapMode(MapMode.MAP_2D),
          setPosition(
            {
              latitude: 45.96265,
              longitude: 12.65504,
            },
            1000
          ),
          refreshTiles,
          addMarkerAtPosition(
            PlanningTools.INITIAL_POINT,
            {
              latitude: 45.96265,
              longitude: 12.65504,
              height: 45,
              displayheight: 1,
            },
            1000
          )
        )
        // done
      })
    } catch (error) {
      console.error(error)
    }
  }, [])

  const bottomNavigationHandler = (
    event: SyntheticEvent<any>,
    newValue: number
  ) => {
    switch (newValue) {
      case 0:
        // if (renderCanvas) {
        //   setRenderCanvas(false)
        //   setMyVRCanvas(undefined)
        // } else {
        //   setRenderCanvas(true)
        //   setTimeout(() => {
        //     setMyVRCanvas(canvasRef.current!)
        //   }, 1000)
        // }
        break
      case 1:
        // if (mode === MapMode.MAP_2D) {
        //   setMode(MapMode.MAP_3D)
        // } else {
        //   setMode(MapMode.MAP_2D)
        // }
        break
      case 2:
        // myVRProvider && myVRProvider.execute(setZoom('zoomIn'))
        break
      case 3:
        // myVRProvider && myVRProvider.execute(setZoom('zoomOut'))
        break
      case 4:
        // myVRProvider &&
        //   myVRProvider.execute(
        //     setMapTileStyle(
        //       'dark',
        //       {
        //         appCode: '',
        //         appId: '',
        //         appKey: '',
        //       },
        //       MapsCountry.INTERNATIONAL
        //     )
        //   )
        break
      case 5:
        // myVRProvider && myVRProvider.execute(getPosition(console.info))
        break
      case 6:
        // myVRProvider &&
        //   myVRProvider.execute(
        //     setPosition(
        //       {
        //         latitude: 44.398293189388554,
        //         longitude: 8.9347796624486708,
        //       },
        //       10
        //     )
        //   )
        break
      default:
        break
    }
  }

  return (
    <div>
      {renderCanvas && (
        <canvas
          ref={canvasRef}
          className={style.myVRCanvas}
          // to disable right click/onContectMenu in React
          onContextMenu={(e) => e.preventDefault()}
          // onClick={handleClick}
        />
      )}
      <BottomNavigation
        // value={value}
        onChange={bottomNavigationHandler}
        showLabels
        className={style.bottomNavigation}
      >
        <BottomNavigationAction
          label={renderCanvas ? 'Dispose' : 'New Instance'}
          icon={<RestoreIcon />}
        />
        <BottomNavigationAction
          // label={mode === MapMode.MAP_2D ? '3D' : '2D'}
          icon={<FavoriteIcon />}
        />
        <BottomNavigationAction label="Zoom In" icon={<AddIcon />} />
        <BottomNavigationAction label="Zoom Out" icon={<RemoveIcon />} />
        <BottomNavigationAction label="Map Style" icon={<MapIcon />} />
        <BottomNavigationAction label="getPosition" icon={<RemoveIcon />} />
        <BottomNavigationAction label="setPosition" icon={<RemoveIcon />} />
      </BottomNavigation>
    </div>
  )
}

interface ITestMyVRAloneProp {}
