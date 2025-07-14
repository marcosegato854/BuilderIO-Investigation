import { curry } from 'ramda'
import { Coord3DPlanning } from 'store/features/planning/types'
import { enc, getPageY, getPageX } from 'utils/myVR/helpers'
import { Position, MyVRCommandObject, Layers } from 'utils/myVR/types'
import { toJson } from 'utils/strings'

export const setPosition = curry(
  (position: Position, height: number | null, myVR: MyVR): MyVR => {
    const command: MyVRCommandObject = {
      command: 'setPosition',
      composite: 1,
      layer: Layers.MAP3D_INPUT,
      latitude: Number(position.latitude),
      longitude: Number(position.longitude),
      // "time": 2000, // this could animate the movement but doesn't work with the car and it's bumpy in 2d mode
    }
    if (height) command.height = height // distance from the ground: 1 = earth; 20 = road... used to be like that but now it's replaced by "height"?
    // disabled, it makes the zoom stick to that level resetting user interactions
    // if (mapMode === MapMode.MAP_3D) command.height = lod // distance from the ground: 1 = earth; 20 = road... used to be like that but now it's replaced by "height"?
    myVR.execute(enc(command))
    return myVR
  }
)

export const resetNorth = (myVR: MyVR): MyVR => {
  const targetDegrees = 0
  const followCmd: MyVRCommandObject = {
    command: 'setPosition',
    composite: 1,
    layer: Layers.MAP3D_INPUT,
    yaw: targetDegrees,
  }
  myVR.execute(enc(followCmd))
  return myVR
}

export const getPosition = curry(
  (callback: (position: Position) => void, myVR: MyVR): MyVR => {
    const command: MyVRCommandObject = {
      command: 'getPosition',
      composite: 1,
      layer: Layers.MAP3D_INPUT,
    }
    const pos = toJson(myVR.execute(enc(command)), 'MYVR')
    callback(pos)
    return myVR
  }
)

export const getCoordinatesOfPointClickedOnMap = curry(
  (
    callback: (waypoint: Coord3DPlanning | null) => void,
    e: MouseEvent | TouchEvent,
    myVR: MyVR
  ): MyVR => {
    const pageY = getPageY(e)
    const pageX = getPageX(e)
    const x = pageX
    const y = myVR.canvas.height - pageY

    getCoordinatesOfPoint(callback, { x, y }, myVR)

    return myVR
  }
)

export const getCoordinatesOfPoint = curry(
  (
    callback: (waypoint: Coord3DPlanning | null) => void,
    point: Position3D,
    myVR: MyVR
  ): MyVR => {
    const { x, y } = point
    const result = toJson(
      myVR.execute(
        enc([
          {
            // TODO: this could be expensive and should be memoized
            command: 'getPositionForScreenCoordinate',
            composite: 1,
            layer: Layers.MAP3D_INPUT, // it's deprecated to use this on the layer and not on the composite, but it seems it's the only way it works syncronously
            asynchronous: false,
            x,
            y,
          },
        ])
      ),
      'MYVR'
    )
    if (result) {
      const coordinateX: number = result.longitude
      const coordinateY: number = result.latitude
      const coordinateHeight: number = result.height
      const wp: Coord3DPlanning = {
        x: coordinateX,
        y: coordinateY,
        height: coordinateHeight,
        isFreePoint: false,
      }
      callback(wp)
    } else {
      console.error(
        `[MYVR] getPositionForScreenCoordinate returned no results for ${x},${y}`
      )
      callback(null)
    }
    return myVR
  }
)

export const getScreenCoordinates = curry(
  (
    callback: (position: Position3D, canvas: HTMLCanvasElement) => void,
    point: Position3D,
    myVR: MyVR
  ): MyVR => {
    const { x, y, z } = point
    const result = toJson(
      myVR.execute(
        enc([
          {
            command: 'getScreenCoordinateForPosition',
            composite: 1,
            asynchronous: false,
            longitude: x,
            latitude: y,
            height: z,
          },
        ])
      ),
      'MYVR'
    )
    callback({ ...result, y: myVR.canvas.height - result.y }, myVR.canvas)
    return myVR
  }
)

/**
 * gets the elements under a point clicked
 * it'ASYNC so it doens't support callbacks
 */
export const getElementsClicked = curry(
  (e: MouseEvent | TouchEvent, myVR: MyVR): MyVR => {
    // in React we need nativeEvent in order to get the offset
    const x = Math.round(getPageX(e))
    const y = Math.round(myVR.canvas.height - getPageY(e))
    toJson(
      myVR.execute(
        enc([
          {
            command: 'getElementAtScreenPosition',
            composite: 1,
            x,
            y,
          },
        ])
      ),
      'MYVR'
    )
    return myVR
  }
)
