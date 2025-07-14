import * as math from 'mathjs'
import { curry, flatten } from 'ramda'
import * as Rematrix from 'rematrix'
import { setPosition } from 'utils/myVR/common/position'
import {
  degreesToRadians,
  enc,
  getPositionAtCenterAsync,
  haveLayer,
  radiansToDegrees,
} from 'utils/myVR/helpers'
import { Layers, Models, MyVRCommandObject } from 'utils/myVR/types'
import { toJson } from 'utils/strings'

export const addCar = curry((position: Point | null, myVR: MyVR): MyVR => {
  // const currentPosition = getPositionAtCenter(myVR)
  // const carPosition = position || currentPosition
  const carPosition = position
  if (carPosition) {
    carPosition.height = carPosition.height || 0
    console.info(
      `[MYVR] add car at ${carPosition.latitude},${carPosition.longitude},${carPosition.height}`
    )
    setCarPosition(carPosition, false, null, 200, myVR)
  } else {
    console.warn('[MYVR] cannot add the car, no current position')
  }
  return myVR
})

/**
 * center the map on the car
 */
export const findCar = (myVR: MyVR): MyVR => {
  getModelPosition(({ x, y, z }: Position3D) => {
    const command2: MyVRCommandObject = {
      command: 'convertPointToLatLon',
      composite: 1,
      x,
      y,
      z,
    }
    const currentModelPosition = toJson(myVR.execute(enc(command2), 'MYVR'))
    setCarPosition(currentModelPosition, false, null, 200, myVR)
    setPosition(currentModelPosition, null, myVR)
  }, myVR)
  return myVR
}

const MODEL_ANGLE_ADJUSTMENT = 0.1
const getInitialModelMatrix = (cameraHeight: number | null, myVR: MyVR) => {
  /** scale up the car based on camera height */
  const carSize = Math.max((cameraHeight || 200) / 1000, 0.1)

  /** generate the base matrix on whitch the transformations will be made */
  const flattened: number[] = flatten([
    [carSize, 0.0, 0.0, 0.0],
    [0.0, carSize, 0.0, 0.0],
    [0.0, 0.0, carSize, 0.0],
    [0.0, 0.0, 0.0, 1.0],
  ])
  const rematrixInitial = Rematrix.fromString(
    `matrix3d(${flattened.toString()})`
  )
  const rotationMatrixX = Rematrix.rotateX(90)
  const rotationMatrixY = Rematrix.rotateY(-6)
  const rematrixParsed = [
    rematrixInitial,
    rotationMatrixX,
    rotationMatrixY,
  ].reduce(Rematrix.multiply)
  return math.clone(
    math.matrix([
      rematrixParsed.slice(0, 4),
      rematrixParsed.slice(4, 8),
      rematrixParsed.slice(8, 12),
      rematrixParsed.slice(12, 16),
    ])
  )
}

const applyRotationToMatrix = (angle: number, newModelMatrix: math.Matrix) => {
  newModelMatrix.subset(
    math.index(0, 0),
    Math.cos(angle) // cos(a)
  )
  newModelMatrix.subset(
    math.index(0, 1),
    Math.sin(angle) // sin(a)
  )
  newModelMatrix.subset(
    math.index(1, 0),
    -Math.sin(angle) // -sin(a)
  )
  newModelMatrix.subset(
    math.index(1, 1),
    Math.cos(angle) // cos(a)
  )
}

const applyTranslationToMatrix = (
  newModelPosition: Position3D,
  currentModelMatrix: math.Matrix,
  newModelMatrix: math.Matrix
) => {
  newModelMatrix.subset(
    math.index(3, 0),
    Number(newModelPosition.x) -
      (currentModelMatrix.subset(math.index(3, 0)) as never)
  )
  newModelMatrix.subset(
    math.index(3, 1),
    Number(newModelPosition.y) -
      (currentModelMatrix.subset(math.index(3, 1)) as never)
  )
  newModelMatrix.subset(
    math.index(3, 2),
    Number(newModelPosition.z) -
      (currentModelMatrix.subset(math.index(3, 2)) as never)
  )
}

const applyMatrixToCar = (
  currentModelMatrix: math.Matrix,
  newModelMatrix: math.Matrix,
  myVR: MyVR
) => {
  const hasLayer = haveLayer(Layers.MODEL, myVR)
  if (hasLayer) {
    const resultingMatrix = math.flatten(
      math.multiply(currentModelMatrix, newModelMatrix).toArray()
    )
    const cmd = {
      command: 'setMatrix',
      composite: 1,
      layer: Layers.MODEL,
      id: Models.CAR,
      matrix: resultingMatrix,
    }
    myVR.execute(enc(cmd))
  }
}

const getNewModelPosition = (point: Point, myVR: MyVR): Position3D => {
  const projectedPoint = toJson(
    myVR.execute(
      enc([
        {
          command: 'convertPointFromLatLon',
          composite: 1,
          latitude: point.latitude, // y
          longitude: point.longitude, // x
        },
      ])
    ),
    'MYVR'
  )
  return {
    ...projectedPoint,
    z: point.height || 0,
  }
}

const followCar = (targetDegrees: number, myVR: MyVR) => {
  const followCmd: MyVRCommandObject = {
    command: 'setPosition',
    composite: 1,
    layer: Layers.MAP3D_INPUT,
    yaw: targetDegrees,
    // lod: 15,
  }
  myVR.execute(enc(followCmd))
}

/**
 * Moves and rotates the car
 */
export const setCarPosition = curry(
  (
    point: Point,
    follow: boolean,
    yaw: number | null,
    cameraHeight: number | null,
    myVR: MyVR
  ): MyVR => {
    // exit from the function if one of the coordinates is not a number
    if (isNaN(point.latitude) || isNaN(point.longitude)) {
      console.warn('[MYVR] Coordinates must be numbers', point)
      return myVR
    }

    // get new model position
    const newModelPosition = getNewModelPosition(point, myVR)

    // get current model position
    // getModelPosition((currentModelPoint: Position3D) => {
    // if (!yaw && (!currentModelPoint || isNil(currentModelPoint.x))) {
    //   console.warn(
    //     `[MYVR] currentModelPoint (${JSON.stringify(
    //       currentModelPoint || {}
    //     )}) or yaw (${yaw}) not available`
    //   )
    //   return
    // }
    if (!yaw) {
      console.warn(`[MYVR] yaw (${yaw}) not available`)
      return myVR
    }
    if (!cameraHeight) {
      console.warn(`[MYVR] cameraHeight not available`)
      return myVR
    }
    if (!newModelPosition) {
      console.warn(`[MYVR] newModelPosition not available`)
      return myVR
    }
    // update the z at center with an async call, ready for next update
    // TODO: maybe we should get the position (to retrieve the height) at car coordinates and not at center
    getPositionAtCenterAsync(myVR)

    // use the current values to setup car position
    const currentModelMatrix: math.Matrix = getInitialModelMatrix(
      cameraHeight,
      myVR
    )

    // normal object 0deg
    const newModelMatrix = math.matrix([
      [1.0, 0, 0.0, 0.0],
      [0, 1.0, 0.0, 0.0],
      [0.0, 0.0, 1.0, 0.0],
      [0.0, 0.0, 0.0, 1.0],
    ])

    // To rotate on Z-axis
    // const rawAngle = isNil(yaw)
    //   ? calculateAngle(newModelPosition, currentModelPoint)
    //   : degreesToRadians(yaw)
    const rawAngle = degreesToRadians(yaw)
    const angle = rawAngle + MODEL_ANGLE_ADJUSTMENT

    applyRotationToMatrix(angle, newModelMatrix)

    applyTranslationToMatrix(
      newModelPosition,
      currentModelMatrix,
      newModelMatrix
    )

    // apply the resulting matrix
    applyMatrixToCar(currentModelMatrix, newModelMatrix, myVR)

    // follow the car
    if (follow) {
      const targetDegrees = -(radiansToDegrees(angle) - 95)
      followCar(targetDegrees, myVR)
    }
    // }, myVR)

    return myVR
  }
)

/**
 * get the current position of the car
 */
// TODO: not working, the callback always returns {complete:false}
export const getModelPosition = curry(
  (callback: (position: Position3D) => void, myVR: MyVR): MyVR => {
    const command: MyVRCommandObject = {
      command: 'getPosition',
      composite: 1,
      id: Models.CAR,
      layer: Layers.MODEL,
      asynchronous: false,
    }
    const pos = toJson(myVR.execute(enc(command)), 'MYVR')
    callback(pos)
    return myVR
  }
)
