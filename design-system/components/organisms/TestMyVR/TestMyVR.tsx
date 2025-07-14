/* eslint-disable @typescript-eslint/no-explicit-any */
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import AddIcon from '@mui/icons-material/Add'
import FavoriteIcon from '@mui/icons-material/Favorite'
import MapIcon from '@mui/icons-material/Map'
import RemoveIcon from '@mui/icons-material/Remove'
import RestoreIcon from '@mui/icons-material/Restore'
import useMyVRProvider from 'hooks/useMyVRProvider'
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
import { setMapTileStyle } from 'utils/myVR/common/mapTileStyle'
import { getPosition, setPosition } from 'utils/myVR/common/position'
import { setZoom } from 'utils/myVR/common/zoom'
import { MapMode } from 'utils/myVR/types'
import style from './TestMyVR.module.scss'

export default function TestMyVR(/* props: ITestMyVRProp */) {
  const canvasRef: RefObject<HTMLCanvasElement> = useRef(null)
  const [myVRProvider, setMyVRCanvas] = useMyVRProvider()
  const [renderCanvas, setRenderCanvas] = useState<boolean>(true)
  const [mode, setMode] = useState<MapMode>(MapMode.MAP_2D)

  /**
   * first myVR setup, at mount
   */
  useEffect(() => {
    if (!myVRProvider) return
    // const position: Position = {
    //   latitude: 45.9562503,
    //   longitude: 12.6597197,
    //   // latitude: 44.398293189388554,
    //   // longitude: 8.9347796624486708,
    // }
    // myVRProvider.execute(setPosition(position)(15), addInputHandler)
    myVRProvider.execute(
      // setPosition(position)(15),
      addInputHandler(null)
    )
  }, [myVRProvider])

  /**
   * change map mode
   */
  useEffect(() => {
    if (myVRProvider) {
      if (mode === MapMode.MAP_2D) {
        myVRProvider.execute(setMapMode(MapMode.MAP_2D))
      } else {
        myVRProvider.execute(setMapMode(MapMode.MAP_3D))
      }
    }
  }, [myVRProvider, mode])

  useEffect(() => {
    if (!canvasRef.current) return
    setMyVRCanvas(canvasRef.current)
  }, [setMyVRCanvas])

  const bottomNavigationHandler = (
    event: SyntheticEvent<any>,
    newValue: number
  ) => {
    switch (newValue) {
      case 0:
        if (renderCanvas) {
          setRenderCanvas(false)
          setMyVRCanvas(undefined)
        } else {
          setRenderCanvas(true)
          setTimeout(() => {
            setMyVRCanvas(canvasRef.current!)
          }, 1000)
        }
        break
      case 1:
        if (mode === MapMode.MAP_2D) {
          setMode(MapMode.MAP_3D)
        } else {
          setMode(MapMode.MAP_2D)
        }
        break
      case 2:
        myVRProvider && myVRProvider.execute(setZoom('zoomIn'))
        break
      case 3:
        myVRProvider && myVRProvider.execute(setZoom('zoomOut'))
        break
      case 4:
        myVRProvider &&
          myVRProvider.execute(
            setMapTileStyle(
              'dark',
              {
                appCode: '',
                appId: '',
                appKey: '',
              },
              MapsCountry.INTERNATIONAL
            )
          )
        break
      case 5:
        myVRProvider && myVRProvider.execute(getPosition(console.info))
        break
      case 6:
        myVRProvider &&
          myVRProvider.execute(
            setPosition(
              {
                latitude: 44.398293189388554,
                longitude: 8.9347796624486708,
              },
              10
            )
          )
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
          label={mode === MapMode.MAP_2D ? '3D' : '2D'}
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

interface ITestMyVRProp {}
