import {
  curry,
  findIndex,
  flatten,
  mergeDeepRight,
  reduceWhile,
  splitAt,
  splitWhen,
} from 'ramda'
import { PositionNotification } from 'store/features/position/types'
import { findNearest } from 'geolib'
import { Layers, MyVRCommandObject } from 'utils/myVR/types'
import {
  Arch,
  Path,
  RawCoordinate,
  Waypoint,
} from 'store/features/planning/types'
import { store } from 'store'
import { flushLogsAction } from 'store/features/system/slice'
import { toJson } from 'utils/strings'

export const enc = (
  commands: MyVRCommandObject | MyVRCommandObject[]
): string => {
  // TODO: add them to an array on window so the can be exported alltogether
  // console.log('[MYVR]', JSON.stringify(commands, null, 4))
  /**  start debug */
  // const w: any = window
  // w.commands = w.commands || []
  // w.commands = w.commands.concat(commands)
  /**  end debug */
  return JSON.stringify(commands)
}

export const getPositionAtCenter = (myVR: MyVR): Point | null => {
  try {
    const currentPosition = toJson(
      myVR.execute(
        enc([
          {
            composite: 1,
            // TODO: this could be expensive and should be memoized
            command: 'getPositionForScreenCoordinate',
            x: Math.round(myVR.canvas.clientWidth / 2),
            y: Math.round(myVR.canvas.clientHeight / 2),
            asynchronous: false,
          },
        ])
      ),
      'MYVR'
    )
    const hitOnMap = currentPosition.hits?.find(
      (h: PositionHit) => h.layerid === Layers.MAP
    )
    return hitOnMap || null
  } catch (error) {
    console.error(error)
    store.dispatch(flushLogsAction(true))
    console.error('Memory issue detected attempting getPositionAtCenter')
  }
  return null
}

export const getPositionAtCenterCB = curry(
  (cb: (p: Point | null) => void, myVR: MyVR): MyVR => {
    try {
      const currentPosition: { hits?: PositionHit[] } = toJson(
        myVR.execute(
          enc([
            {
              composite: 1,
              // TODO: this could be expensive and should be memoized
              command: 'getPositionForScreenCoordinate',
              x: Math.round(myVR.canvas.clientWidth / 2),
              y: Math.round(myVR.canvas.clientHeight / 2),
              asynchronous: false,
            },
          ])
        ),
        'MYVR'
      )
      const hitOnMap = currentPosition.hits?.find(
        (h: PositionHit) => h.layerid === Layers.MAP
      )
      if (hitOnMap) {
        cb(hitOnMap)
        return myVR
      }
      cb(null)
      return myVR
    } catch (error) {
      console.error(error)
      store.dispatch(flushLogsAction(true))
      console.error('Memory issue detected attempting getPositionAtCenterCB')
    }
    return myVR
  }
)

/** returns the result on the globalCallback with action = depthClicked */
export const getPositionAtCenterAsync = (myVR: MyVR) => {
  myVR.execute(
    enc([
      {
        composite: 1,
        command: 'getPositionForScreenCoordinate',
        x: Math.round(myVR.canvas.clientWidth / 2),
        y: Math.round(myVR.canvas.clientHeight / 2),
        asynchronous: true,
      },
    ])
  )
  return myVR
}

export const radiansToDegrees = (radians: number): number =>
  radians * (180 / Math.PI)

export const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180)

export const getPointFromPositionNotification = (
  p: PositionNotification
): Point => {
  const {
    position: { map: lastMap },
  } = p
  if (lastMap) {
    const lastCoords = lastMap
    return {
      latitude: lastCoords.latitude,
      longitude: lastCoords.longitude,
      height: lastCoords.displayheight,
    }
  }
  return {
    latitude: 0,
    longitude: 0,
    height: 0,
  }
}

export const parseHitRecords = (records: HitRecord[]): Hit[] => {
  return flatten(
    records.map((r) =>
      r.hits.map((h) => ({
        feature: h.id,
        layer: Number(r['layer-id']),
      }))
    )
  )
}

export const getClosestPoint = (
  points: Position3D[],
  point: Position3D
): Position3D | null => {
  const nearest: Point = findNearest(
    { latitude: point.y, longitude: point.x },
    points.map((p) => ({ latitude: p.y, longitude: p.x }))
  ) as Point
  if (nearest)
    return {
      x: nearest.longitude,
      y: nearest.latitude,
    }
  return null
}

export const getInsertionIndex = (
  points: Position3D[],
  point: Position3D,
  waypoints: Waypoint[]
): number => {
  const matches = reduceWhile(
    (acc, p) => !acc.found,
    (acc, p) => {
      const wpindex = waypoints.findIndex(
        (w) => w.longitude === p.x && w.latitude === p.y
      )
      if (wpindex > 0) acc.index = wpindex
      if (point.x === p.x && point.y === p.y) acc.found = true
      // console.log('helpers.ts (112) # acc', acc)
      return acc
    },
    { found: false, index: 0 },
    points
  )
  return Math.min(matches.index + 1, waypoints.length - 1)
}

export const scaleBoundingBox = (
  bb: BoundingBox,
  scaleFactor: number
): BoundingBox => {
  const latDistance = bb.maxLatitude - bb.minLatitude
  const lngDistance = bb.maxLongitude - bb.minLongitude
  const dLng = latDistance * scaleFactor
  const dLlat = lngDistance * scaleFactor
  const padding = Math.max(dLlat, dLng)
  return {
    maxLatitude: bb.maxLatitude + padding,
    maxLongitude: bb.maxLongitude + padding,
    minLatitude: bb.minLatitude - padding,
    minLongitude: bb.minLongitude - padding,
  }
}

export const getPageX = (e: MouseEvent | TouchEvent) =>
  e instanceof MouseEvent ? e.pageX : getTouchEventPageX(e)
export const getPageY = (e: MouseEvent | TouchEvent) =>
  e instanceof MouseEvent ? e.pageY : getTouchEventPageY(e)

export const getTouchEventPageX = (e: TouchEvent) =>
  e.touches[0]?.pageX || e.changedTouches[0]?.pageX
export const getTouchEventPageY = (e: TouchEvent) =>
  e.touches[0]?.pageY || e.changedTouches[0]?.pageY

export const haveLayer = (layer: Layers, myVR: MyVR): boolean => {
  const cmd = [
    {
      command: 'haveLayer',
      composite: 1,
      layer,
    },
  ]
  const response = myVR.execute(enc(cmd))
  return toJson(response, 'MYVR').result
}

export const haveFeature = (
  layer: Layers,
  featureId: number | string,
  myVR: MyVR
): boolean => {
  const ids = getFeatureIds(layer, myVR)
  const featureNormalized =
    typeof featureId === 'string' ? featureId : featureId.toString()
  return ids.includes(featureNormalized)
}

export const getFeatureIds = (layer: Layers, myVR: MyVR): string[] => {
  const cmd = [
    {
      command: 'getFeatureIds',
      composite: 1,
      layer,
    },
  ]
  const response = myVR.execute(enc(cmd))
  const ids = toJson(response, 'MYVR').features
  return ids
}

export const snapToGround = () => {
  // return true
  return process.env.NX_SNAP_TO_GROUND === 'true'
}

export const splitPath = (path: Path, nearest: Point): Path[] => {
  // const arcsLeft: Arch[] = []
  // const arcsRight: Arch[] = []
  if (!path.arcs) return []
  /* find the arc to split */
  const splitIndex = findIndex((arch: Arch) => {
    return !!arch.coordinates.find((coord: RawCoordinate) => {
      return coord[0] === nearest.latitude && coord[1] === nearest.longitude
    })
  }, path.arcs)
  // console.log('helpers.ts (220) # splitIndex', splitIndex)
  const [arcsLeft, arcsRight] = splitAt(splitIndex, path.arcs)
  /* split coordinates */
  const arcToSplit = path.arcs[splitIndex]
  const [coordsLeft, coordsRight] = splitWhen((coord: RawCoordinate) => {
    return coord[0] === nearest.latitude && coord[1] === nearest.longitude
  }, arcToSplit.coordinates)
  /* add the splitting coordinate to the second array */
  coordsLeft.push(coordsRight[0])
  /* create the two arcs with partial coordinates */
  const arcLeft = mergeDeepRight(arcToSplit, {
    coordinates: coordsLeft,
  }) as unknown as Arch
  const arcRight = mergeDeepRight(arcToSplit, {
    coordinates: coordsRight,
  }) as unknown as Arch
  /* replace arcs in the two arrays */
  arcsLeft.push(arcLeft)
  arcsRight[0] = arcRight
  // console.log('helpers.ts (228) # arcsLeft', arcsLeft)
  // console.log('helpers.ts (228) # arcsRight', arcsRight)
  // const [arcsLeft, arcsRight] = splitWhen((a:Arch)=>{
  //   return a.
  // })
  // TODO: colorize second path
  return [
    mergeDeepRight(path, { arcs: arcsLeft }) as Path,
    // TODO: the id should be dynamic or none (ask marco)
    mergeDeepRight(path, { arcs: arcsRight }) as Path,
  ]
}

export const calculateAngle = (
  newModelPosition: Position3D,
  currentModelPoint: Position3D
) => {
  const deltaY = Number(newModelPosition.y) - Number(currentModelPoint.y)
  const deltaX = Number(newModelPosition.x) - Number(currentModelPoint.x)
  return Math.atan2(deltaY, deltaX)
}

export const utmToLatLng = (
  point: number[],
  projection: string,
  myVR: MyVR
): number[] => {
  const convertCmd = [
    {
      command: 'projectPoints',
      composite: 1,
      points: point,
      target: 'EPSG:4326',
      source: `EPSG:${projection}`,
    },
  ]
  const convertedMin = myVR.execute(enc(convertCmd))
  return toJson(convertedMin, 'MYVR').points
}
