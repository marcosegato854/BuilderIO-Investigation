/* eslint-disable */
export const ZamekProtivin = [
  {
    command: 'createLayer',
    composite: 1,
    layer: 4556,
    type: 'HSPCLayer',
    name: 'Zamek Protivin',
  },
  {
    command: 'configure',
    composite: 1,
    layer: 4556,
    url: 'http://datamonster.myvr.net/mMap/data/pointcloud/APR/ZamekProtivin/Version4/Version4RGBN131072',
    configureShader: {
      attributes: [
        {
          name: 'Red',
          format: 'component',
        },
        {
          name: 'Green',
          format: 'component',
        },
        {
          name: 'Blue',
          format: 'component',
        },
      ],
    },
  },
  {
    command: 'setRenderOptions',
    composite: 1,
    layer: 4556,
    'point-mode': 'fixed-world',
    'user-transform': [
      1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 771027.585,
      1139225.48, -350.0, 1.0,
    ],
    'point-size': 0.05,
    'point-style': 'GLPoint',
  },
  {
    command: 'setDetailOptions',
    composite: 1,
    layer: 4556,
    'memory-budget': 150.0,
    interpolate: false,
    // 'point-budget': 7.0,
  },
  {
    command: 'setSplat',
    composite: 1,
    layer: 4556,
    splat: false,
  },
]

export const Denver = [
  {
    command: 'createLayer',
    composite: 1,
    layer: 100,
    type: 'OpenStreetMapService',
    name: 'DemMYVR',
  },
  {
    command: 'configure',
    composite: 1,
    layer: 100,
    'min-lod': 3,
    'height-offset': 0,
    'is-heightmap': true,
    servers: [
      {
        type: 0,
        urls: [
          'http://datamonster.myvr.net/mMap/data/2d/tiles/dem/nasa_dem_version_myvr1.1/%l/%x/%y.tif',
        ],
      },
    ],
    'max-lod': 6,
    'height-scale': 1,
  },
  {
    command: 'createLayer',
    composite: 1,
    layer: 4556,
    type: 'HSPCLayer',
    name: 'Denver',
    visible: true,
  },
  {
    command: 'configure',
    composite: 1,
    layer: 4556,
    configureShader: {
      attributes: [
        {
          name: 'R',
          format: 'component',
        },
        {
          name: 'G',
          format: 'component',
        },
        {
          name: 'B',
          format: 'component',
        },
      ],
    },
    url: 'http://datamonster.myvr.net/mMap/data/pointcloud/APR/Denver/RGB',
  },
  {
    command: 'setRenderOptions',
    composite: 1,
    layer: 4556,
    'point-mode': 'fixed-world',
    'clear-depth-before': false,
    'clear-depth-after': false,
    'user-transform': [
      1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 3.0, 14.0,
      -11.0, 1.0,
    ],
    'point-size': 0.5,
    'point-style': 'Disc',
  },
  {
    command: 'setDetailOptions',
    composite: 1,
    layer: 4556,
    'memory-budget': 750.0,
    interpolate: false,
    // 'point-budget': 0.0,
  },
  {
    command: 'setSplat',
    composite: 1,
    layer: 4556,
    splat: true,
  },
  {
    command: 'setProjection',
    composite: 1,
    layer: 4556,
    projection: 'EPSG:4978',
  },
]
