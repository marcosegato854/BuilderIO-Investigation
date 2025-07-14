import { MapsConfig, MapsCountry, TileProvider } from 'store/features/system/types'
import { tilesUrl } from 'utils/here/hereMaps'
import { MyVRCommandObject, Layers } from 'utils/myVR/types'

const baiduCommands = (): MyVRCommandObject[] => [
  {
    command: 'createComposite',
    composite: 1,
  },
  {
    command: 'defineProjection',
    definition: '+proj=merc +lon_0=0 +units=m +ellps=clrk66 +no_defs',
    name: 'baidu-mercator-clarke66',
  },
  {
    command: 'setProjection',
    composite: 1,
    projection: 'baidu-mercator-clarke66',
  },
  {
    command: 'createLayer',
    composite: 1,
    layer: Layers.TILE_MAP_SERVICE,
    type: 'BaiduTileService',
    projection: 'baidu-mercator-clarke66',
    visible: true,
    priority: 2,
  },
]

// TODO: add naver commands
const naverCommands = (): MyVRCommandObject[] => [
  {
    command: 'createComposite',
    composite: 1,
  },
  {
    command: 'setProjection',
    composite: 1,
    projection: 'EPSG:3857',
  },
  {
    command: 'createLayer',
    composite: 1,
    layer: Layers.TILE_MAP_SERVICE,
    // type: 'NaverTileService',
    projection: 'EPSG:3857',
    visible: true,
    priority: 2,
  },
]

const hereMapsCommands = (): MyVRCommandObject[] => [
  {
    command: 'createComposite',
    composite: 1,
  },
  {
    command: 'setProjection',
    composite: 1,
    projection: 'EPSG:3857',
  },
  {
    command: 'createLayer',
    composite: 1,
    layer: Layers.TILE_MAP_SERVICE,
    type: 'OpenStreetMapService',
    projection: 'EPSG:3857',
    priority: 2,
  },
]

const openStreetMapCommands = (): MyVRCommandObject[] => [
  {
    command: 'createComposite',
    composite: 1,
  },
  {
    command: 'setProjection',
    composite: 1,
    projection: 'EPSG:3857',
  },
  {
    command: 'createLayer',
    composite: 1,
    layer: Layers.TILE_MAP_SERVICE,
    type: 'OpenStreetMapService',
    projection: 'EPSG:3857',
    priority: 2,
  },
]

const commandGenerator = (
  mapsConfig: MapsConfig,
): MyVRCommandObject[] => {
  switch (mapsConfig.tileProvider) {
    case TileProvider.HEREMAPS:
      return hereMapsCommands()
    case TileProvider.BAIDU:
      return baiduCommands()
    case TileProvider.NAVER:
      return naverCommands()
    case TileProvider.OPENSTREETMAP:
      return openStreetMapCommands()
    default:
      return openStreetMapCommands()
  }
}

// config for Data Collection
export const initial2DMapConfig = (
  mapsConfig: MapsConfig,
  mapsCountry: MapsCountry
): MyVRCommandObject[] => [
  ...commandGenerator(mapsConfig),
  /** ALPHA FIX: the car is visible under the terrain, but it affects pointcloud, icons and trackline too */
  // {
  //   command: 'setRenderOption',
  //   composite: 1,
  //   'transparent-layer-alpha': 0.8,
  //   'transparent-layers': [
  //     Layers.MAP,
  //   ],
  // },
  {
    command: 'createLayer',
    composite: 1,
    layer: Layers.MAP3D_INPUT,
    type: 'Map3DInput',
  },
  {
    command: 'configure',
    composite: 1,
    layer: Layers.MAP3D_INPUT,
    type: 2,
    // "yaw-input-factor": 0.4, // Input event will be multiplied by this factor before changing yaw. Used to change yaw sensitivity and to invert yaw control (if negative).
    // "pitch-input-factor": 0.4,
    'min-pitch': 45,
    'max-pitch': 85,
  },
  {
    command: 'createLayer',
    composite: 1,
    layer: Layers.OPEN_STREET_MAP_SERVICE_HEIGHTMAP,
    type: 'OpenStreetMapService',
    name: 'TERRAIN',
  },
  {
    command: 'configure',
    composite: 1,
    layer: Layers.OPEN_STREET_MAP_SERVICE_HEIGHTMAP,
    'min-lod': 3,
    'height-offset': 0.0,
    'is-heightmap': true,
    servers: [
      {
        type: 0,
        urls: process.env.NX_HERE_MAPS_HEIGHT_MAPS?.split(','),
      },
    ],
    'max-lod': 11,
    'height-scale': 1.0,
  },
  {
    command: 'configure',
    composite: 1,
    layer: Layers.TILE_MAP_SERVICE,
    priority: 0,
    'use-depth-test': true,
    retry: 0,
    'use-parent-tile': true,
    'use-filtering': true,
    servers: [
      {
        type: 0,
        urls: [tilesUrl(mapsConfig, mapsCountry, 'dark')],
      },
    ],
    'max-lod': 18,
    'default-server-type': 0,
    version: 0,
    'have-premultiply-alpha': false,
    alpha: 1,
  },
  {
    command: 'createLayer',
    composite: 1,
    layer: Layers.MAP,
    type: 'Map',
  },
  {
    command: 'configure',
    composite: 1,
    layer: Layers.MAP,
    'input-type': 1,
    priority: 3,
    'use-higher-lod-first': false,
    'default-texture':
      'http://datamonster.myvr.net/mMap/data/2d/textures/default_textures/wire.png',
    'generate-skirt': true,
  },
]
