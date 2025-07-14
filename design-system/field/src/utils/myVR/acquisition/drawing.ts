import { curry } from 'ramda'
import { Position } from 'store/features/position/types'
import { getPosition } from 'utils/myVR/common/position'
import { enc, haveLayer } from 'utils/myVR/helpers'
import { Layers } from 'utils/myVR/types'

// https://drop.myvr.net/files/2020.11/55428/Documentation/tutorials/getting-started/working-with-json-api/configs/#on-top-of-map-tiles

/**
 * draw a new track segment with the first two points
 */
export const drawTrackSegment = curry(
  (
    previousPoint: Point,
    point: Point,
    trackLineID: number,
    styleId: string,
    projection: string | null,
    myVR: MyVR
  ): MyVR => {
    const hasLayer = haveLayer(Layers.FEATURES_TRACKLINE, myVR)
    if (hasLayer) {
      // TODO: disabled projection, not working for trajectory
      // const projectionString = projection ? `EPSG:${projection}` : undefined
      const tracklineCommands = [
        {
          command: 'addObjects',
          composite: 1,
          layer: Layers.FEATURES_TRACKLINE,
          objects: [
            {
              id: trackLineID,
              type: 'lines',
              closed: false,
              points: [
                {
                  x: previousPoint.longitude,
                  y: previousPoint.latitude,
                  z: previousPoint.height,
                },
                {
                  x: point.longitude,
                  y: point.latitude,
                  z: point.height,
                },
              ],
              // projection: projectionString,
              metadata: {
                styleid: 'combined',
                colorkey: styleId,
              },
            },
          ],
        },
      ]
      myVR.execute(enc(tracklineCommands))
    }
    return myVR
  }
)

/**
 * add points to an existing track
 */
export const addPointToTrack = curry(
  (point: Point, trackLineID: number, myVR: MyVR): MyVR => {
    const addNewPointToTrackline = [
      {
        command: 'addPoints',
        composite: 1,
        layer: Layers.FEATURES_TRACKLINE,
        id: trackLineID,
        points: [
          {
            x: point.longitude,
            y: point.latitude,
            z: point.height,
          },
        ],
      },
    ]

    myVR.execute(enc(addNewPointToTrackline))
    return myVR
  }
)

/**
 * add marker to icons layer at current position
 */
export const addMarkerAtCurrentPosition = curry(
  // TODO: not used at the moment
  (
    markerType: 'start' | 'end',
    id: number,
    height: number,
    myVR: MyVR
  ): MyVR => {
    getPosition((position) => {
      const addMarkerToIconsLayer = [
        {
          command: 'addIcon',
          composite: 1,
          layer: Layers.ICONS,
          id,
          group: `${markerType}-group`,
          latitude: position.latitude,
          longitude: position.longitude,
          height,
        },
      ]
      myVR.execute(enc(addMarkerToIconsLayer))
    }, myVR)
    return myVR
  }
)

/**
 * add marker to icons layer at specified position
 */
export const addMarkerAtPosition = curry(
  (markerType: string, position: Position, id: number, myVR: MyVR): MyVR => {
    const addMarkerToIconsLayer = [
      {
        command: 'addIcon',
        composite: 1,
        layer: Layers.ICONS,
        id,
        group: `${markerType}-group`,
        latitude: position.latitude,
        longitude: position.longitude,
        height: position.height || 0,
        'sample-height': !position.height,
      },
    ]
    myVR.execute(enc(addMarkerToIconsLayer))
    return myVR
  }
)

/**
 * add marker to icons layer at specified position
 */
export const removeIconGroup = curry((markerType: string, myVR: MyVR): MyVR => {
  const removeIconsGroupCommand = [
    {
      command: 'removeIcons',
      composite: 1,
      layer: Layers.ICONS,
      group: `${markerType}-group`,
    },
  ]
  myVR.execute(enc(removeIconsGroupCommand))
  return myVR
})
