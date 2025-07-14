import chroma from 'chroma-js'
import { curry } from 'ramda'
import { AcquisitionProfile } from 'store/features/dataStorage/types'
import { PlanningTools } from 'store/features/planning/types'
import { Theme } from 'store/features/theme/slice'
import { enc, snapToGround } from 'utils/myVR/helpers'
import { FeatureObj } from 'utils/myVR/init/styleConfig'
import { Layers, Models, MyVRCommandObject } from 'utils/myVR/types'
import { darkTheme } from 'utils/themes/mui'

// https://drop.myvr.net/files/2020.11/55428/Documentation/tutorials/getting-started/working-with-json-api/configs/#on-top-of-map-tiles

/**
 * add planning lauers
 */
export const addAcquisitionLayers = curry(
  (
    theme: Theme,
    profile: AcquisitionProfile | undefined,
    disableFeatures: boolean,
    myVR: MyVR
  ): MyVR => {
    console.info(
      `[MYVR] addAcquisitionLayers with profile ${profile} and theme ${theme}`
    )
    const getGlbFile = () => {
      switch (profile) {
        case AcquisitionProfile.MARINE:
          return '/assets/models/Boat2.glb'
        case AcquisitionProfile.RAIL:
          return '/assets/models/Train2.glb'
        case AcquisitionProfile.ROAD:
          return '/assets/models/Car.glb'
        default:
          return '/assets/models/Car.glb'
      }
    }
    const modelUrl = getGlbFile()
    console.info(`[MYVR] model url ${modelUrl}`)
    const featureCommands = !disableFeatures
      ? [
          /** TRACKLINE */
          {
            command: 'createLayer',
            composite: 1,
            layer: Layers.FEATURES_TRACKLINE,
            type: 'Features',
            priority: 4,
          },
          /** ICONS */
          {
            command: 'createLayer',
            composite: 1,
            layer: Layers.ICONS,
            type: 'Icons',
            priority: 7,
          },
          {
            command: 'addIconGroups',
            composite: 1,
            layer: Layers.ICONS,
            groups: [
              {
                name: 'warning-group',
                'max-icons': 200,
                'y-align': 'vcenter',
                'x-align': 'hcenter',
                'scale-size': 0.3,
                bitmap: '/assets/img/WarningMarker.png',
              },
              {
                name: 'error-group',
                'max-icons': 200,
                'y-align': 'vcenter',
                'x-align': 'hcenter',
                'scale-size': 0.3,
                bitmap: '/assets/img/ErrorMarker.png',
              },
              {
                name: 'start-group',
                'max-icons': 50,
                'y-align': 'bottom',
                'x-align': 'hcenter',
                'scale-size': 1,
                bitmap: '/assets/img/StartMarker.png',
              },
              {
                name: 'end-group',
                'max-icons': 50,
                'scale-size': 1,
                'y-align': 'bottom',
                'x-align': 'hcenter',
                bitmap: '/assets/img/EndMarker.png',
              },
              {
                name: `${PlanningTools.INITIAL_POINT}-group`,
                'max-icons': 200,
                'y-align': 'vcenter',
                'x-align': 'hcenter',
                'scale-size': 1,
                bitmap: '/assets/img/InitialMarker.png',
              },
              {
                name: `${PlanningTools.FINAL_POINT}-group`,
                'max-icons': 200,
                'y-align': 'vcenter',
                'x-align': 'hcenter',
                'scale-size': 1,
                bitmap: '/assets/img/FinalMarker.png',
              },
              {
                name: 'nextStart-group',
                'max-icons': 200,
                'y-align': 'bottom',
                'x-align': 'right',
                'scale-size': 1,
                bitmap: '/assets/img/trackStart.png',
              },
              {
                name: 'nextEnd-group',
                'max-icons': 200,
                'y-align': 'bottom',
                'x-align': 'left',
                'scale-size': 1,
                bitmap: '/assets/img/trackEnd.png',
              },
              {
                name: 'nextHighlightStart-group',
                'max-icons': 200,
                'y-align': 'bottom',
                'x-align': 'right',
                'scale-size': 1,
                bitmap: '/assets/img/trackHighlightStart.png',
              },
              {
                name: 'nextHighlightEnd-group',
                'max-icons': 200,
                'y-align': 'bottom',
                'x-align': 'left',
                'scale-size': 1,
                bitmap: '/assets/img/trackHighlightEnd.png',
              },
            ],
          },
        ]
      : []
    const modelCommands = [
      /** MODEL */
      {
        command: 'createLayer',
        composite: 1,
        layer: Layers.MODEL,
        type: 'Model',
        priority: 66, // make it stay on top, otherwise it flickers
      },
      {
        command: 'add',
        composite: 1,
        layer: Layers.MODEL,
        id: Models.CAR,
        url: modelUrl,
        'z-up': false,
        priority: 6,
      },
      {
        command: 'setMatrix',
        composite: 1,
        layer: Layers.MODEL,
        id: Models.CAR,
        // prettier-ignore
        matrix: [
          1.0, 0.0, 0.0, 0.0,
          0.0, 1.0, 0.0, 0.0,
          0.0, 0.0, 1.0, 0.0,
          0.0, 0.0, 0.0, 1.0
        ],
      },
    ]

    const commands = [...featureCommands, ...modelCommands]
    myVR.execute(enc(commands))
    return myVR
  }
)

/**
 * update planning layers styles
 */
export const updateTrackStyles = curry(
  (zoomScale: boolean, disableFeatures: boolean, myVR: MyVR): MyVR => {
    if (disableFeatures) return myVR
    // TODO: retrieve dynamic values like colors and thickness from an API
    // TODO: should use RGB values from the palette
    console.info(`[MYVR] snapToGround=${snapToGround()}`)
    const good = chroma(darkTheme.colors.accuracy_good as string).rgb()
    const average = chroma(darkTheme.colors.accuracy_average as string).rgb()
    const bad = chroma(darkTheme.colors.accuracy_bad as string).rgb()
    const commands = [
      {
        command: 'configure',
        composite: 1,
        layer: Layers.FEATURES_TRACKLINE,
        styles: [
          {
            // like css classes
            key: 'neutral',
            'inner-size': 5,
            // 'line-max-zoom-scale': 2,
            'line-min-zoom-scale': 0.8,
            'inner-color': [
              82 / 255, // red
              231 / 255, // green
              255 / 255, // blue
              1, // opacity
            ],
            'outer-size': 0,
            // 'outer-color': [ // DISABLED
            //   // GREEN
            //   0, // red
            //   1, // green
            //   0, // blue
            //   1, // opacity
            // ],
            'height-offset': 1,
            'snap-to-ground': snapToGround(),
            'depth-test': false, // keeps the track always on top
            'depth-write': false,
            'zoom-scale': zoomScale,
            priority: 10 - Number(FeatureObj.NAVIGATION_TRACK_GOOD_ACCURACY),
            // "subdivide": true
          },
          {
            // like css classes
            key: FeatureObj.NAVIGATION_TRACK_GOOD_ACCURACY,
            'inner-size': 5,
            // 'line-max-zoom-scale': 2,
            'line-min-zoom-scale': 0.8,
            'inner-color': [
              good[0] / 255, // red
              good[1] / 255, // green
              good[2] / 255, // blue
              1, // opacity
            ],
            'outer-size': 0,
            // 'outer-color': [ // DISABLED
            //   // GREEN
            //   0, // red
            //   1, // green
            //   0, // blue
            //   1, // opacity
            // ],
            'height-offset': 1,
            'snap-to-ground': snapToGround(),
            'depth-test': false, // keeps the track always on top
            'depth-write': false,
            'zoom-scale': zoomScale,
            priority: 10 - Number(FeatureObj.NAVIGATION_TRACK_GOOD_ACCURACY),
            // "subdivide": true
          },
          {
            // like css classes
            key: FeatureObj.NAVIGATION_TRACK_AVERAGE_ACCURACY,
            'inner-size': 5,
            // 'line-max-zoom-scale': 2,
            'line-min-zoom-scale': 0.8,
            'inner-color': [
              // YELLOW
              average[0] / 255, // red
              average[1] / 255, // green
              average[2] / 255, // blue
              1, // opacity
            ],
            'outer-size': 0,
            // 'outer-color': [ // DISABLED
            //   // YELLOW
            //   1,
            //   1,
            //   0,
            //   1,
            // ],
            'height-offset': 1,
            'snap-to-ground': snapToGround(),
            'depth-test': false, // keeps the track always on top
            'depth-write': false,
            'zoom-scale': zoomScale,
            priority: 10 - Number(FeatureObj.NAVIGATION_TRACK_AVERAGE_ACCURACY),
            // "subdivide": true
          },
          {
            // like css classes
            key: FeatureObj.NAVIGATION_TRACK_BAD_ACCURACY,
            'inner-size': 5,
            // 'line-max-zoom-scale': 2,
            'line-min-zoom-scale': 0.8,
            'inner-color': [
              // RED
              bad[0] / 255, // red
              bad[1] / 255, // green
              bad[2] / 255, // blue
              1, // opacity
            ],
            'outer-size': 0,
            // 'outer-color': [ // DISABLED
            //   // RED
            //   1, // red
            //   0, // green
            //   0, // blue
            //   1, // opacity
            // ],
            'height-offset': 1,
            'snap-to-ground': snapToGround(),
            'depth-test': false, // keeps the track always on top
            'depth-write': false,
            'zoom-scale': zoomScale,
            priority: 10 - Number(FeatureObj.NAVIGATION_TRACK_BAD_ACCURACY),
            // "subdivide": true
          },
          {
            // like css classes
            key: 'combined',
            'inner-size': 5,
            'variable-inner-colors': [
              // green = good accuracy
              {
                r: 0,
                g: 1,
                b: 0,
                a: 1,
              },
              // yellow = average accuracy
              {
                r: 1,
                g: 1,
                b: 0,
                a: 1,
              },
              // red = bad accuracy
              {
                r: 1,
                g: 0,
                b: 0,
                a: 1,
              },
            ],
            'variable-color-key': 'colorkey',
            'variable-color-scales': [0.5, 0.5, 0.5],
            'outer-size': 0,
            'height-offset': 1,
            'snap-to-ground': snapToGround(),
            'depth-test': false, // keeps the track always on top
            'depth-write': false,
            'zoom-scale': zoomScale,
          },
        ],
      },
    ]

    myVR.execute(enc(commands))
    return myVR
  }
)

/**
 * add planned tracks layer
 */
export const addPlannedTracksLayers = (myVR: MyVR): MyVR => {
  const commands = [
    /** TRACKS */
    {
      command: 'createLayer',
      composite: 1,
      layer: Layers.FEATURES_PLANNING_TRACK,
      type: 'Features',
      /* TODO check with the new MyVR version, due to changes on the capture colors */
      /* 11 is over the maximum track priority of 10 (10 - 0) */
      priority: 11,
    },
    {
      command: 'configure',
      composite: 1,
      layer: Layers.FEATURES_PLANNING_TRACK,
      'default-style': {
        'inner-size': 0,
        'outer-size': 1,
        'outer-color': [0.5, 0.5, 0.5, 0.5],
        'height-offset': 1,
        'snap-to-ground': true,
        'depth-test': false, // keeps the track always on top
        'depth-write': false,
        'zoom-scale': false,
      },
    },
    {
      command: 'createLayer',
      composite: 1,
      layer: Layers.NEXT_TRACK,
      type: 'Features',
      /* TODO check with the new MyVR version, due to changes on the capture colors */
      /* 11 is over the maximum track priority of 10 (10 - 0) */
      priority: 6,
    },
    {
      command: 'configure',
      composite: 1,
      layer: Layers.NEXT_TRACK,
      'default-style': {
        'inner-size': 0,
        'outer-size': 1,
        'outer-color': [0.5, 0.5, 0.5, 0.5],
        'height-offset': 1,
        'snap-to-ground': true,
        'depth-test': false, // keeps the track always on top
        'depth-write': false,
        'zoom-scale': false,
      },
    },
    /** POLYLINE */
    {
      command: 'createLayer',
      composite: 1,
      layer: Layers.FEATURES_POLYLINE,
      type: 'Features',
      priority: 5,
    },
    {
      command: 'configure',
      composite: 1,
      layer: Layers.FEATURES_POLYLINE,
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
    {
      command: 'configure',
      composite: 1,
      layer: Layers.FEATURES_POLYLINE,
      styles: [
        {
          // like css classes
          key: 'polyline',
          'inner-size': 8,
          'inner-color': [
            // RED
            1, // red
            1, // green
            1, // blue
            0.3, // opacity
          ],
          'outer-size': 0,
          // 'outer-color': [
          //   // DISABLED
          //   // RED
          //   1, // red
          //   0, // green
          //   0, // blue
          //   1, // opacity
          // ],
          'height-offset': 1,
          'snap-to-ground': true,
          'depth-test': false, // keeps the track always on top
          'depth-write': false,
          'line-mask-pattern': '00001111000011110000111100001111',
          'line-mask-size': 50,
          'line-mask-expand': false,
          // priority: 10000,
          'zoom-scale': true,
          'line-mask-zoom-scale': true,
          'line-mask-nostep-zoom-scale': true,
          'line-mask-max-zoom-scale': 1,
          'line-mask-min-zoom-scale': 2,
          'line-max-zoom-scale': 2,
          'line-min-zoom-scale': 0.5,
          // "subdivide": true
        },
      ],
    },
  ]
  myVR.execute(enc(commands))
  return myVR
}

/**
 * update planned tracks layers styles
 */
export const updatePolylineStyles = curry((theme: Theme, myVR: MyVR): MyVR => {
  const commands = [
    {
      command: 'configure',
      composite: 1,
      layer: Layers.FEATURES_POLYLINE,
      styles: [
        {
          // like css classes
          key: 'polyline',
          'inner-size': 8,
          'inner-color':
            theme === 'dark'
              ? [
                  1, // red
                  1, // green
                  1, // blue
                  0.3, // opacity
                ]
              : [
                  0, // red
                  0, // green
                  0, // blue
                  0.3, // opacity
                ],
          'outer-size': 0,
          // 'outer-color': [
          //   // DISABLED
          //   // RED
          //   1, // red
          //   0, // green
          //   0, // blue
          //   1, // opacity
          // ],
          'height-offset': 1,
          'snap-to-ground': true,
          'depth-test': false, // keeps the track always on top
          'depth-write': false,
          'line-mask-pattern': '00001111000011110000111100001111',
          'line-mask-size': 50,
          'line-mask-expand': false,
          // priority: 10000,
          'zoom-scale': true,
          'line-mask-zoom-scale': true,
          'line-mask-nostep-zoom-scale': true,
          'line-mask-max-zoom-scale': 1,
          'line-mask-min-zoom-scale': 2,
          'line-max-zoom-scale': 2,
          'line-min-zoom-scale': 0.5,
          // "subdivide": true
        },
      ],
    },
  ]

  myVR.execute(enc(commands))
  return myVR
})

export const hideMapLayers = (myVR: MyVR): MyVR => {
  console.info('[MYVR] hide maps layers ')
  // it sets a black png texture instead of the map tiles. hiding the layers creates side effects
  const command: MyVRCommandObject = {
    command: 'configure',
    composite: 1,
    layer: Layers.TILE_MAP_SERVICE,
    servers: [
      {
        urls: [
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjYGBg+A8AAQQBAHAgZQsAAAAASUVORK5CYII=',
        ],
      },
    ],
  }
  myVR.execute(enc(command))
  const reloadTiles: MyVRCommandObject = {
    command: 'reloadTileServices',
    composite: 1,
    layer: Layers.MAP, // Map Layer
    services: [
      {
        id: Layers.TILE_MAP_SERVICE, // OpenStreetService Layer
      },
    ],
  }
  myVR.execute(enc(reloadTiles))
  return myVR
}
