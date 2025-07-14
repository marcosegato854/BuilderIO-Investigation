import { environment } from 'environments/environment'
import { curry, flatten } from 'ramda'
import { Path, Waypoint } from 'store/features/planning/types'
import { addMarkerAtPosition } from 'utils/myVR/acquisition/drawing'
import { enc, getFeatureIds, haveFeature, haveLayer } from 'utils/myVR/helpers'
import { FeatureObj } from 'utils/myVR/init/styleConfig'
import { Layers, MyVRCommandObject } from 'utils/myVR/types'
import { kmToM, labelWithUnit, mtToFt, unitValueFull } from 'utils/numbers'
import { arcs, getPolygonStyleName } from 'utils/planning/polygonHelpers'
import { archsToPos3D } from 'utils/planning/typeConversions'

// https://drop.myvr.net/files/2020.11/55428/Documentation/tutorials/getting-started/working-with-json-api/configs/#on-top-of-map-tiles

type TrackOptions = {
  selected: boolean
  polygon: boolean
  color: string | null
  projection: string | null
}

const drawTrackOnLayer = (
  points: Position3D[],
  layer: Layers,
  trackLineID: number,
  { color, polygon, selected, projection }: TrackOptions,
  myVR: MyVR,
  forceStyle?: string
) => {
  const hasLayer = haveLayer(layer, myVR)
  if (hasLayer) {
    const styleid = forceStyle || getPolygonStyleName(color, polygon, selected)
    console.info(
      `[MYVR] draw track on layer (${layer}) with id(${trackLineID})`
    )
    const hasFeature = haveFeature(layer, trackLineID, myVR)
    const removeCommands = hasFeature
      ? [
          {
            command: 'clearPoints',
            composite: 1,
            layer,
            id: trackLineID,
          },
        ]
      : []
    // TODO: disabled projection, not working for trajectory
    // const projectionString = projection ? `EPSG:${projection}` : undefined
    const addCommands = [
      {
        command: 'addObject',
        composite: 1,
        layer,
        id: trackLineID,
        // type: 'lines',
        type: polygon ? 'poly' : 'lines',
        points,
        // projection: projectionString,
        metadata: {
          styleid,
        },
      },
    ]
    const commands = [...removeCommands, ...addCommands]

    myVR.execute(enc(commands))
  }
}

/**
 * draw a new track segment with the first two points, with a replica for the scanrange if needed
 */
export const drawTrackWithScanRange = curry(
  (
    points: Position3D[],
    trackLineID: number,
    { color, polygon, selected, projection }: TrackOptions,
    myVR: MyVR
  ): MyVR => {
    const renderScanRange = !environment.disableScanRange && !polygon
    if (renderScanRange) {
      drawTrackOnLayer(
        points,
        Layers.FEATURES_SCAN_RANGE,
        trackLineID,
        { selected: true, polygon, color: null, projection },
        myVR,
        'scanrange'
      )
    }
    drawTrackOnLayer(
      points,
      Layers.FEATURES_PLANNING_TRACK,
      trackLineID,
      { selected, polygon, color, projection },
      myVR
    )
    return myVR
  }
)

/**
 * draw the next track segment with some effects
 */
export const drawNextTrack = curry(
  (
    points: Position3D[],
    trackLineID: number,
    color: string | null,
    myVR: MyVR
  ): MyVR => {
    drawTrackOnLayer(
      points,
      Layers.NEXT_TRACK,
      trackLineID,
      { selected: true, polygon: false, color, projection: null },
      myVR
    )
    return myVR
  }
)

/**
 * draw a new track segment with the first two points
 */
export const drawTrack = curry(
  (
    points: Position3D[],
    trackLineID: number,
    { selected, polygon, color, projection }: TrackOptions,
    myVR: MyVR
  ): MyVR => {
    drawTrackOnLayer(
      points,
      Layers.FEATURES_PLANNING_TRACK,
      trackLineID,
      { selected, polygon, color, projection },
      myVR
    )
    return myVR
  }
)

/**
 * draw a polyline
 */
export const drawPolyline = curry(
  (
    points: Position3D[],
    id: number,
    projection: string | null,
    myVR: MyVR
  ): MyVR => {
    drawTrackOnLayer(
      points,
      Layers.FEATURES_POLYLINE,
      id,
      { selected: true, polygon: false, color: null, projection },
      myVR,
      'polyline'
    )
    return myVR
  }
)

const drawPolygonTrackOnLayer = (
  points: Position3D[],
  layer: Layers,
  trackLineID: number,
  pathID: number,
  { selected, color }: Pick<TrackOptions, 'selected' | 'color'>,
  removeFirst: boolean,
  myVR: MyVR,
  forceStyle?: string
) => {
  const hasLayer = haveLayer(layer, myVR)
  if (hasLayer) {
    const styleid = forceStyle || getPolygonStyleName(color, false, selected)
    const id = `${trackLineID}-${pathID}`
    const hasFeature = haveFeature(layer, id, myVR)
    if (removeFirst && hasFeature) {
      const commandsRemove = [
        {
          command: 'clearPoints',
          composite: 1,
          layer,
          id,
        },
      ]
      myVR.execute(enc(commandsRemove))
    }
    const commands = [
      {
        command: 'addObject',
        composite: 1,
        layer,
        id,
        type: 'lines',
        points,
        metadata: {
          styleid,
        },
      },
    ]
    myVR.execute(enc(commands))
  }
}

/**
 * draw a new track segment with the first two points
 */
export const drawPolygonTracks = curry(
  (
    internal: Path[],
    trackLineID: number,
    selectedInternalid: number,
    selectAllInternalTracks: boolean,
    myVR: MyVR
  ): MyVR => {
    internal.forEach((path) => {
      if (typeof path.id === 'undefined' || Number.isNaN(Number(path.id)))
        return
      const selected = selectAllInternalTracks || selectedInternalid === path.id
      const points = archsToPos3D(arcs(path))
      const renderScanRange =
        !environment.disableScanRange && !selectAllInternalTracks
      renderScanRange &&
        drawPolygonTrackOnLayer(
          points,
          Layers.FEATURES_SCAN_RANGE,
          trackLineID,
          path.id,
          { selected, color: path.color || null },
          true,
          myVR,
          'scanrange'
        )
      drawPolygonTrackOnLayer(
        points,
        Layers.FEATURES_PLANNING_TRACK,
        trackLineID,
        path.id,
        { selected, color: path.color || null },
        !selectAllInternalTracks,
        myVR
      )
    })
    return myVR
  }
)

/**
 * draw a new track segment with the first two points
 */
export const drawWaypoints = curry(
  (
    points: Position3D[],
    trackLineID: number,
    length: number,
    polygon: boolean,
    unit: 'metric' | 'imperial',
    myVR: MyVR
  ): MyVR => {
    if (environment.disableWaypoints) return myVR
    const hasLayer = haveLayer(Layers.WAYPOINTS, myVR)
    if (!hasLayer) return myVR
    const unitValue = unitValueFull(kmToM, length, unit)
    const formattedLength =
      unitValue < 1
        ? labelWithUnit('M', mtToFt, length * 1000, unit)
        : labelWithUnit('KM', kmToM, length, unit)
    // TODO: any clue on how to optimize this ???
    const commands = [
      ...Array(points.length + 1)
        .fill(0)
        .map((_, index) => ({
          command: 'removeObject',
          composite: 1,
          layer: Layers.WAYPOINTS,
          id: `${trackLineID}-${index}`,
        })),
      ...points.map((point, index) => ({
        command: 'addObjects',
        composite: 1,
        layer: Layers.WAYPOINTS,
        objects: [
          {
            id: `${trackLineID}-${index}`,
            type: 'points',
            points: [point],
            'text-anchor-horizontal': 'centre',
            'text-anchor-vertical': 'top',
            metadata: {
              lbl:
                !polygon &&
                length > 0 &&
                index > 0 &&
                index === points.length - 1
                  ? `${formattedLength}`
                  : null,
              styleid: getWayPointStyleID(index, points.length, polygon),
            },
          },
        ],
      })),
    ]

    myVR.execute(enc(commands))
    return myVR
  }
)

/**
 * remove the tracks of a polygon
 */
export const removePolygonTracks = curry(
  (trackLineID: number, internal: number[], myVR: MyVR): MyVR => {
    const hasScanRangeLayer = haveLayer(Layers.FEATURES_SCAN_RANGE, myVR)
    if (hasScanRangeLayer) {
      if (!environment.disableScanRange) {
        const ids = getFeatureIds(Layers.FEATURES_SCAN_RANGE, myVR)
        const scanRangeCommands = flatten(
          internal.map((pathId) => {
            const id = `${trackLineID}-${pathId}`
            if (!ids.includes(id)) return null
            return [
              {
                command: 'removeObject',
                composite: 1,
                layer: Layers.FEATURES_SCAN_RANGE,
                id,
              },
            ]
          })
        ).filter((c) => c !== null) as MyVRCommandObject[]
        myVR.execute(enc(scanRangeCommands))
      }
    }
    const hasTrackRangeLayer = haveLayer(Layers.FEATURES_PLANNING_TRACK, myVR)
    if (hasTrackRangeLayer) {
      const ids = getFeatureIds(Layers.FEATURES_PLANNING_TRACK, myVR)
      const tracklineCommands = flatten(
        internal.map((pathId) => {
          const id = `${trackLineID}-${pathId}`
          if (!ids.includes(id)) return null
          return [
            {
              command: 'removeObject',
              composite: 1,
              layer: Layers.FEATURES_PLANNING_TRACK,
              id,
            },
          ]
        })
      ).filter((c) => c !== null) as MyVRCommandObject[]
      myVR.execute(enc(tracklineCommands))
    }
    return myVR
  }
)

/**
 * remove a track
 */
export const removeTrack = curry((trackLineID: number, myVR: MyVR): MyVR => {
  const hasPlanningTrackLayer = haveLayer(Layers.FEATURES_PLANNING_TRACK, myVR)
  if (hasPlanningTrackLayer) {
    const tracklineCommands = [
      {
        command: 'removeObject',
        composite: 1,
        layer: Layers.FEATURES_PLANNING_TRACK,
        id: trackLineID,
      },
    ]
    myVR.execute(enc(tracklineCommands))
  }
  const hasScanRangeLayer = haveLayer(Layers.FEATURES_SCAN_RANGE, myVR)
  if (hasScanRangeLayer) {
    if (!environment.disableScanRange) {
      const scanRangeCommands = [
        {
          command: 'removeObject',
          composite: 1,
          layer: Layers.FEATURES_SCAN_RANGE,
          id: trackLineID,
        },
      ]
      myVR.execute(enc(scanRangeCommands))
    }
  }
  return myVR
})

/**
 * remove a polyline
 */
export const removePolyline = curry((id: number, myVR: MyVR): MyVR => {
  const hasLayer = haveLayer(Layers.FEATURES_POLYLINE, myVR)
  if (hasLayer) {
    const tracklineCommands = [
      {
        command: 'removeObject',
        composite: 1,
        layer: Layers.FEATURES_POLYLINE,
        id,
      },
    ]
    myVR.execute(enc(tracklineCommands))
  }
  return myVR
})

/**
 * remove a track
 */
export const removeWaypoints = curry(
  (trackLineID: number, length: number, myVR: MyVR): MyVR => {
    if (environment.disableWaypoints) return myVR
    const hasLayer = haveLayer(Layers.WAYPOINTS, myVR)
    if (hasLayer) {
      const tracklineCommands = [
        ...Array(length)
          .fill(0)
          .map((_, index) => ({
            command: 'removeObject',
            composite: 1,
            layer: Layers.WAYPOINTS,
            id: `${trackLineID}-${index}`,
          })),
      ]
      myVR.execute(enc(tracklineCommands))
    }
    return myVR
  }
)

/**
 * gets the style of a waypoint
 * @param index
 * @param length
 * @param polygon
 * @returns
 */
function getWayPointStyleID(
  index: number,
  length: number,
  polygon: boolean
): string {
  if (polygon) return FeatureObj.POLYGON_VERTEX_WAYPOINT
  if (index === 0) return FeatureObj.FIRST_WAYPOINT
  if (index === length - 1) return FeatureObj.LAST_WAYPOINT
  return FeatureObj.WAYPOINT
}
