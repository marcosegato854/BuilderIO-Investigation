import { curry } from 'ramda'
import { enc, scaleBoundingBox, utmToLatLng } from 'utils/myVR/helpers'
import { MyVRCommandObject, Layers } from 'utils/myVR/types'
import { toJson } from 'utils/strings'

export const setZoom = curry(
  (zoomDirection: 'zoomIn' | 'zoomOut', myVR: MyVR): MyVR => {
    if (zoomDirection === 'zoomIn') {
      // myVR.inputEvent DOCS
      // https://drop.myvr.net/files/2021.03/57586/Documentation/cpp-api/html/namespacemy_v_r_1_1m_map.html#a4964a03e2a7fbc19adc971bc561fe06e
      myVR.inputEvent(
        -1, // Composite that receives the input
        4, // ZOOM_EVENT
        myVR.canvas.clientWidth / 2, // center of screen
        myVR.canvas.clientHeight / 2, // center of screen
        0,
        0,
        1.1 // default value 1.1
      )
    } else {
      myVR.inputEvent(
        -1,
        4,
        myVR.canvas.clientWidth / 2,
        myVR.canvas.clientHeight / 2,
        0,
        0,
        0.9 // default value 0.9
      )
    }

    return myVR
  }
)

export const set3DHeight = curry((height: number, myVR: MyVR): MyVR => {
  const command: MyVRCommandObject = {
    command: 'setPosition',
    composite: 1,
    layer: Layers.MAP3D_INPUT,
    height, // distance from the ground: 1 = earth; 20 = road... used to be like that but now it's replaced by "height"?
    // "time": 2000, // this could animate the movement but doesn't work with the car and it's bumpy in 2d mode
  }
  myVR.execute(enc(command))
  return myVR
})

/**
 * fit view to planned tracks bounds
 */
export const getRealZoom = curry(
  (zoom: number, cb: (zoom: number) => void, myVR: MyVR): MyVR => {
    const getZoomCommand = [
      {
        command: 'getLodForZoom',
        composite: 1,
        layer: Layers.TILE_MAP_SERVICE,
        zoom,
      },
    ]

    const zoomResult = toJson(myVR.execute(enc(getZoomCommand)), 'MYVR')
    cb(zoomResult.lod)
    return myVR
  }
)

/**
 * fit view to covered tracks bounds
 */
export const fitCoveredFeatures = (myVR: MyVR): MyVR => {
  /** get bounding box */
  const getCommand = [
    {
      command: 'getBoundingBox',
      composite: 1,
      layer: Layers.FEATURES_TRACKLINE,
    },
  ]

  const { aabb } = toJson(myVR.execute(enc(getCommand)), 'MYVR') || {}
  if (!aabb) {
    console.warn('fitCoveredFeatures cannot get bounding box')
    return myVR
  }
  const { min, max } = aabb
  /** scale the bouning box */
  const boundingBox: BoundingBox = {
    maxLatitude: max[1],
    maxLongitude: max[0],
    minLatitude: min[1],
    minLongitude: min[0],
  }
  const scaledBoundingBox = scaleBoundingBox(boundingBox, 0.2)
  /** set bounding box */
  const setCommand = [
    {
      'aabb-max-latitude': scaledBoundingBox.maxLatitude,
      'aabb-max-longitude': scaledBoundingBox.maxLongitude,
      'aabb-min-latitude': scaledBoundingBox.minLatitude,
      'aabb-min-longitude': scaledBoundingBox.minLongitude,
      'use-jump-animation': false,
      command: 'setDisplayBoundingBox',
      composite: 1,
      layer: Layers.MAP3D_INPUT,
      time: 1000,
    },
  ]

  myVR.execute(enc(setCommand))

  return myVR
}

/**
 * fit view to covered tracks bounds
 */
export const fitHSPCLayer = curry((projection: string, myVR: MyVR): MyVR => {
  /** get bounding box */
  const cmd = [
    {
      command: 'getInfo',
      composite: 1,
      layer: Layers.HSPC_TREE,
    },
  ]
  const infoRaw = myVR.execute(enc(cmd))
  const info = JSON.parse(infoRaw)
  if (!info) {
    console.warn('fitHSPCLayer cannot get info')
    return myVR
  }
  const aabb = info['bounding-box']
  // const aabb = info['bounding-box-projected']

  // const { aabb } = JSON.parse(myVR.execute(enc(getCommand))) || {}
  if (!aabb) {
    console.warn('fitHSPCLayer cannot get bounding box')
    return myVR
  }
  const { min, max } = aabb

  const convertedMin = utmToLatLng(min, projection, myVR)
  const convertedMax = utmToLatLng(max, projection, myVR)

  /** scale the bouning box */
  const boundingBox: BoundingBox = {
    maxLatitude: convertedMax[1],
    maxLongitude: convertedMax[0],
    minLatitude: convertedMin[1],
    minLongitude: convertedMin[0],
  }
  const scaledBoundingBox = scaleBoundingBox(boundingBox, 0.2)
  /** set bounding box */
  const setCommand = [
    {
      'aabb-max-latitude': scaledBoundingBox.maxLatitude,
      'aabb-max-longitude': scaledBoundingBox.maxLongitude,
      'aabb-min-latitude': scaledBoundingBox.minLatitude,
      'aabb-min-longitude': scaledBoundingBox.minLongitude,
      'use-jump-animation': false,
      command: 'setDisplayBoundingBox',
      composite: 1,
      layer: Layers.MAP3D_INPUT,
      time: 1000,
    },
  ]

  myVR.execute(enc(setCommand))

  return myVR
})
