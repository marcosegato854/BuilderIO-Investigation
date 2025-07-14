import chroma from 'chroma-js'
import { environment } from 'environments/environment'
import { curry, flatten, type, uniq } from 'ramda'
import { PlanningTools, Polygon } from 'store/features/planning/types'
import { Theme } from 'store/features/theme/slice'
import { availableColors, getShadesArray } from 'utils/colors'
import { enc, scaleBoundingBox } from 'utils/myVR/helpers'
import { FeatureObj } from 'utils/myVR/init/styleConfig'
import { Layers } from 'utils/myVR/types'
import { toJson } from 'utils/strings'

// https://drop.myvr.net/files/2020.11/55428/Documentation/tutorials/getting-started/working-with-json-api/configs/#on-top-of-map-tiles

/**
 * add planning layers
 */
export const addPlanningLayers = curry((theme: Theme, myVR: MyVR): MyVR => {
  const scanRangeCommands = environment.disableScanRange
    ? []
    : [
        {
          command: 'createLayer',
          composite: 1,
          layer: Layers.FEATURES_SCAN_RANGE,
          type: 'Features',
          priority: 10,
        },
        {
          command: 'configure',
          composite: 1,
          layer: Layers.FEATURES_SCAN_RANGE,
          'default-style': {
            'inner-size': 0,
            'outer-size': 40,
            'outer-color': [0.5, 0.5, 0.5, 0.1],
            'height-offset': 1,
            'snap-to-ground': true,
            'depth-test': false, // keeps the track always on top
            'depth-write': false,
            'zoom-scale': false,
          },
        },
        /** SCAN RANGE */
        // {
        //   command: 'createFilterGraph',
        //   'filter-graph': 1,
        //   graph: [
        //     {
        //       name: 'ActivateComposite',
        //       start: true,
        //       type: 'mmap-composite',
        //       composite: 1,
        //     },
        //     {
        //       name: 'ClearComposite',
        //       active: true,
        //       type: 'clear-composite',
        //     },
        //     {
        //       name: 'MainDrawFilter',
        //       active: true,
        //       type: 'render-composite',
        //       'layers-included': [Layers.FEATURES_SCAN_RANGE],
        //     },
        //     {
        //       name: 'BlurFilter',
        //       active: true,
        //       type: 'blur',
        //       input: [
        //         {
        //           color: 'RGBA',
        //         },
        //       ],
        //     },
        //   ],
        // },
      ]
  const planningTrackCommands = [
    /** TRACKS */
    {
      command: 'createLayer',
      composite: 1,
      layer: Layers.FEATURES_PLANNING_TRACK,
      type: 'Features',
      priority: 10,
    },
    {
      command: 'configure',
      composite: 1,
      layer: Layers.FEATURES_PLANNING_TRACK,
      'default-style': {
        'inner-size': 0,
        'outer-size': 5,
        'outer-color': [0.5, 0.5, 0.5, 0.5],
        'height-offset': 1,
        'snap-to-ground': true,
        'depth-test': false, // keeps the track always on top
        'depth-write': false,
        'zoom-scale': true,
      },
    },
  ]
  const wayPointsCommands = environment.disableWaypoints
    ? []
    : [
        // const wayPointsCommands = [
        /** WAYPOINTS */
        {
          command: 'createLayer',
          composite: 1,
          layer: Layers.WAYPOINTS,
          type: 'Features',
        },
        {
          command: 'configure',
          composite: 1,
          layer: Layers.WAYPOINTS,
          styles: [
            {
              key: FeatureObj.WAYPOINT,
              'inner-size': 0,
              'outer-size': 0,
              icon:
                theme === 'light'
                  ? '/assets/img/LightDot.png'
                  : '/assets/img/DarkDot.png',
              'bitmap-x-align': 'hcenter',
              'bitmap-y-align': 'vcenter',
              'mesh-scale': 0.5,
              'zoom-scale-rasters': true,
              'height-offset': 1,
              'snap-to-ground': true,
              'depth-test': false, // keeps the track always on top
              'depth-write': false,
              'bitmap-scale': 1,
            },
            {
              key: FeatureObj.FIRST_WAYPOINT,
              icon: '/assets/img/StartMarker.png',
              'bitmap-x-align': 'hcenter',
              'bitmap-y-align': 'bottom',
              'mesh-scale': 1,
              'zoom-scale-rasters': true,
              'height-offset': 1,
              'snap-to-ground': true,
              'depth-test': false, // keeps the track always on top
              'depth-write': false,
              'bitmap-scale': 1,
            },
            {
              key: FeatureObj.LAST_WAYPOINT,
              icon: '/assets/img/EndMarker.png',
              'bitmap-x-align': 'hcenter',
              'bitmap-y-align': 'bottom',
              'mesh-scale': 1,
              'zoom-scale-rasters': true,
              'height-offset': 1,
              'snap-to-ground': true,
              'depth-test': false, // keeps the track always on top
              'depth-write': false,
              'bitmap-scale': 1,
              /** text styling */
              'text-color': theme === 'light' ? [0, 0, 0, 1] : [1, 1, 1, 1],
              'text-shadow-color':
                theme === 'light' ? [1, 1, 1, 1] : [0, 0, 0, 1],
              // 'text-background-color': [0, 0, 0, 0.8],
              // 'bitmap-y-offset': -50,
              // font: '/assets/fonts/Roboto/Roboto-Bold.ttf',
              'text-point-size': 15,
              'label-key': 'lbl',
            },
            {
              key: FeatureObj.POLYGON_VERTEX_WAYPOINT,
              icon:
                theme === 'light'
                  ? '/assets/img/LightDot.png'
                  : '/assets/img/DarkDot.png',
              'bitmap-x-align': 'hcenter',
              'bitmap-y-align': 'vcenter',
              'mesh-scale': 0.25,
              'zoom-scale-rasters': true,
              'height-offset': 1,
              'snap-to-ground': true,
              'depth-test': false, // keeps the track always on top
              'depth-write': false,
              'bitmap-scale': 1,
            },
          ],
        },
      ]
  const iconCommands = [
    /** ICONS */
    {
      command: 'createLayer',
      composite: 1,
      layer: Layers.ICONS,
      type: 'Icons',
      priority: 6,
    },
    {
      command: 'addIconGroups',
      composite: 1,
      layer: Layers.ICONS,
      groups: [
        {
          name: `${PlanningTools.INITIAL_POINT}-group`,
          'max-icons': 200,
          'y-align': 'bottom',
          'x-align': 'hcenter',
          'scale-size': 1,
          bitmap: '/assets/img/InitialMarker.png',
        },
        {
          name: `${PlanningTools.FINAL_POINT}-group`,
          'max-icons': 200,
          'y-align': 'bottom',
          'x-align': 'hcenter',
          'scale-size': 1,
          bitmap: '/assets/img/FinalMarker.png',
        },
      ],
    },
  ]
  const commands = [
    ...scanRangeCommands,
    ...planningTrackCommands,
    ...wayPointsCommands,
    ...iconCommands,
  ]
  myVR.execute(enc(commands))
  return myVR
})

/**
 * update planning layers styles
 */
export const updatePathStyles = curry(
  (tracks: Polygon[], scannerRange: number, myVR: MyVR): MyVR => {
    if (environment.disableTrackStyles) return myVR
    const availableColorsAndShades = uniq(
      flatten(availableColors.map(getShadesArray))
    )
    const planningTrackCommands = [
      {
        command: 'configure',
        composite: 1,
        layer: Layers.FEATURES_PLANNING_TRACK,
        styles: flatten(
          availableColorsAndShades.map((color) => {
            const [red, green, blue] = chroma(color).rgb()
            // const red = r * 255
            // const green = g * 255
            // const blue = b * 255
            return [
              {
                key: `color-${color}`,
                'inner-size': 0,
                'outer-size': 5,
                'outer-color': [red / 255, green / 255, blue / 255, 1],
                'inner-color': [red / 255, green / 255, blue / 255, 0.1],
                'height-offset': 1,
                'snap-to-ground': true,
                'depth-test': false, // keeps the track always on top
                'depth-write': false,
                'zoom-scale': true,
              },
              {
                key: `polygon-color-${color}`,
                'inner-size': 5,
                'outer-size': 5,
                'outer-color': [red / 255, green / 255, blue / 255, 1],
                'inner-color': [red / 255, green / 255, blue / 255, 0.1],
                'height-offset': 1,
                'snap-to-ground': true,
                'depth-test': false, // keeps the track always on top
                'depth-write': false,
                'zoom-scale': true,
              },
              {
                key: `color-${color}-notselected`,
                'inner-size': 0,
                'outer-size': 5,
                'outer-color': [red / 255, green / 255, blue / 255, 0.5],
                'inner-color': [red / 255, green / 255, blue / 255, 0.1],
                'height-offset': 1,
                'snap-to-ground': true,
                'depth-test': false, // keeps the track always on top
                'depth-write': false,
                'zoom-scale': true,
              },
            ]
          })
        ),
      },
    ]
    const nextTrackCommands = [
      {
        command: 'configure',
        composite: 1,
        layer: Layers.NEXT_TRACK,
        styles: flatten(
          availableColorsAndShades.map((color) => {
            const [red, green, blue] = chroma(color).rgb()
            // const red = r * 255
            // const green = g * 255
            // const blue = b * 255
            return [
              {
                key: `color-${color}`,
                'inner-size': 0,
                'outer-size': 8,
                'outer-color': [red / 255, green / 255, blue / 255, 1],
                'inner-color': [red / 255, green / 255, blue / 255, 0.1],
                'height-offset': 1,
                'snap-to-ground': true,
                'depth-test': false, // keeps the track always on top
                'depth-write': false,
                'zoom-scale': true,
              },
            ]
          })
        ),
      },
    ]
    const scanRangeCommands = environment.disableScanRange
      ? []
      : [
          {
            command: 'configure',
            composite: 1,
            layer: Layers.FEATURES_SCAN_RANGE,
            styles: [
              {
                key: 'scanrange',
                'inner-size': scannerRange,
                /* 'outer-size': scannerRange,
            'outer-color': [0, 255, 0, 0.2], */
                'use-line-width-for-diameter': true,
                'inner-color': [0, 125, 0, 0.2],
                'height-offset': 1,
                'line-blur-factor': 1,
                'snap-to-ground': true,
                'depth-test': false, // keeps the track always on top
                'depth-write': false,
                'zoom-scale': false,
              },
            ],
          },
        ]
    const commands = [
      ...planningTrackCommands,
      ...nextTrackCommands,
      ...scanRangeCommands,
    ]
    myVR.execute(enc(commands))
    return myVR
  }
)

/**
 * fit view to planned track bounds
 */
export const fitPlanningFeature = curry(
  (featureId: number | string, myVR: MyVR): MyVR => {
    /** get bounding box */
    const getCommand = [
      {
        command: 'getObjectPointsBoundingBox',
        composite: 1,
        layer: Layers.FEATURES_PLANNING_TRACK,
        id: featureId,
      },
    ]

    const bbResult = toJson(myVR.execute(enc(getCommand)), 'MYVR')
    const { aabb } = bbResult || {}
    if (!aabb) {
      console.warn('fitPlanningFeature cannot get bounding box', bbResult)
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
)

/**
 * fit view to planned tracks bounds
 */
export const fitPlanningFeatures = (myVR: MyVR): MyVR => {
  /** get bounding box */
  const getCommand = [
    {
      command: 'getBoundingBox',
      composite: 1,
      layer: Layers.FEATURES_PLANNING_TRACK,
    },
  ]

  // sometimes the result is an array of boxes, in case I pick the first one
  const bbResult = toJson(myVR.execute(enc(getCommand)), 'MYVR')
  const bbResultAsArray = type(bbResult) === 'Array' ? bbResult : [bbResult]
  const { aabb } = bbResultAsArray[0] || {}
  if (!aabb) {
    console.warn('fitPlanningFeatures cannot get bounding box', bbResult)
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
