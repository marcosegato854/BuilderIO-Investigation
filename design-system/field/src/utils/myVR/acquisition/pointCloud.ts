import { curry } from 'ramda'
import {
  PointBufferSettings,
  PointCloudCommand,
} from 'store/features/pointcloud/types'
import { enc, haveLayer } from 'utils/myVR/helpers'
import { Layers } from 'utils/myVR/types'

// https://drop.myvr.net/files/2020.11/55428/Documentation/tutorials/getting-started/working-with-json-api/configs/#on-top-of-map-tiles

/**
 * draw a new track segment with the first two points
 */
export const addPointCloudLayer = curry(
  (
    projection: string,
    proj4: string,
    bufferSettings: PointBufferSettings,
    disableHspc: boolean,
    disableBuffer: boolean,
    myVR: MyVR
  ): MyVR => {
    console.info(`[POINTCLOUD] add myVR layer p:${projection}, p4:${proj4}`)
    const cmd = [
      {
        command: 'defineProjection',
        composite: 1,
        name: `EPSG:${projection}`,
        definition: proj4,
      },
    ]
    myVR.execute(enc(cmd))
    disableHspc || addHSPCLayer(projection, proj4, myVR)
    disableBuffer ||
      addPointBufferLayer(projection, proj4, bufferSettings, myVR)
    return myVR
  }
)
export const addPointBufferLayer = curry(
  (
    projection: string,
    proj4: string,
    bufferSettings: PointBufferSettings,
    myVR: MyVR
  ): MyVR => {
    const hasLayer = haveLayer(Layers.HSPC_POINT_BUFFER, myVR)
    console.warn('[POINTCLOUD] already has buffer layer', hasLayer)
    if (hasLayer) return myVR
    console.info(
      `[POINTCLOUD] add myVR pointbuffer layer p:${projection}, p4:${proj4}`
    )

    const { folder, ...cleanSettings } = bufferSettings

    const cmd = [
      {
        command: 'createLayer',
        composite: 1,
        layer: Layers.HSPC_POINT_BUFFER,
        type: 'HSPCPointBufferLayer',
        name: 'pointbuffer',
      },
      {
        command: 'setDefaultParameters',
        composite: 1,
        layer: Layers.HSPC_POINT_BUFFER,
        ...cleanSettings,
      },
      {
        command: 'setRenderOptions',
        composite: 1,
        layer: Layers.HSPC_POINT_BUFFER,
        'clear-depth-before': true,
        'point-size': 2,
      },
      {
        command: 'setAttributes',
        composite: 1,
        layer: Layers.HSPC_POINT_BUFFER,
        attributes: [{ role: 'R' }, { role: 'G' }, { role: 'B' }],
      },
      {
        command: 'setColor',
        composite: 1,
        layer: Layers.HSPC_POINT_BUFFER,
        color: {
          r: { role: 'R' },
          g: { role: 'G' },
          b: { role: 'B' },
        },
      },
      {
        command: 'setProjection',
        composite: 1,
        layer: Layers.HSPC_POINT_BUFFER,
        projection: `EPSG:${projection}`,
      },
    ]

    myVR.execute(enc(cmd))
    return myVR
  }
)
export const addHSPCLayer = curry(
  (projection: string, proj4: string, myVR: MyVR): MyVR => {
    const hasLayer = haveLayer(Layers.HSPC_TREE, myVR)
    console.warn('[POINTCLOUD] already has layer', hasLayer)
    if (hasLayer) return myVR
    console.info(`[POINTCLOUD] add myVR layer p:${projection}, p4:${proj4}`)

    const cmd = [
      {
        command: 'createLayer',
        composite: 1,
        layer: Layers.HSPC_TREE,
        type: 'HSPCLayer',
        name: 'pointcloud',
        visible: true,
      },
      {
        command: 'configure',
        composite: 1,
        layer: Layers.HSPC_TREE,
        attributes: [{ role: 'R' }, { role: 'G' }, { role: 'B' }],
      },
      {
        command: 'setRenderOptions',
        composite: 1,
        layer: Layers.HSPC_TREE,
        'clear-depth-before': true,
        'point-size': 2,
      },
      {
        command: 'setDetailOptions',
        composite: 1,
        layer: Layers.HSPC_TREE,
        'memory-budget': 50.0,
        'level-of-detail': 1,
        interpolate: false,
      },
      {
        command: 'setSplat',
        composite: 1,
        layer: Layers.HSPC_TREE,
        splat: true,
      },
      {
        command: 'setProjection',
        composite: 1,
        layer: Layers.HSPC_TREE,
        projection: `EPSG:${projection}`,
      },
    ]

    myVR.execute(enc(cmd))
    return myVR
  }
)

/**
 * draw a new track segment with the first two points
 */
export const addProjection = curry(
  (projection: string, proj4: string, myVR: MyVR): MyVR => {
    const cmd = [
      {
        command: 'defineProjection',
        composite: 1,
        name: `EPSG:${projection}`,
        definition: proj4,
      },
    ]

    myVR.execute(enc(cmd))
    return myVR
  }
)

/**
 * set projection on map layer
 */
export const setProjectionOnMapLayer = curry(
  (projection: string, myVR: MyVR): MyVR => {
    console.info(`'[MYVR] set projection on map layer: EPSG:${projection}'`)
    const cmd = [
      {
        command: 'setProjection',
        composite: 1,
        layer: Layers.TILE_MAP_SERVICE,
        projection: `EPSG:${projection}`,
      },
    ]

    myVR.execute(enc(cmd))
    return myVR
  }
)

export const pointCloudCommand = curry(
  (
    hspcFolderUrl: string,
    { layer, url, id, command }: PointCloudCommand,
    projection: string,
    proj4: string,
    {
      disableHspc,
      disableBuffer,
    }: { disableHspc: boolean; disableBuffer: boolean },
    myVR: MyVR
  ): MyVR => {
    switch (layer) {
      case 'pointbuffer':
        switch (command) {
          case 'add':
            if (url) {
              disableBuffer ||
                addPointBuffer(`${hspcFolderUrl}${url}`, id, myVR)
            } else {
              console.warn('[POINTCLOUD] add pointbuffer command without url')
            }
            break
          case 'remove':
            removePointBuffer(id, myVR)
            break
          default:
            console.warn(`[POINTCLOUD] unknown command ${command}`)
            break
        }
        break
      case 'pointcloud':
        if (url) {
          disableHspc || addHSPCTree(`${hspcFolderUrl}${url}`, projection, myVR)
        } else {
          console.warn('[POINTCLOUD] add hspc command without url')
        }
        break
      case 'final':
        if (url) {
          // TODO: clean the old ones
          console.info(`[POINTCLOUD] add final hspc ${url}`)
          disableHspc || clearHSPCLayer(projection, proj4, myVR)
          disableHspc || addHSPCTree(`${hspcFolderUrl}${url}`, projection, myVR)
        } else {
          console.warn('[POINTCLOUD] add final hspc command without url')
        }
        break
      default:
        console.warn(`[POINTCLOUD] unknown pointcloud layer ${layer}`)
        break
    }
    return myVR
  }
)

export const clearHSPCLayer = curry(
  (projection: string, proj4: string, myVR: MyVR): MyVR => {
    console.info(`[POINTCLOUD] clear HSPC Layer`)
    const cmd = [
      {
        command: 'destroyLayer',
        composite: 1,
        layer: Layers.HSPC_TREE,
      },
    ]
    myVR.execute(enc(cmd))
    addHSPCLayer(projection, proj4, myVR)
    return myVR
  }
)

export const addPointBuffer = curry(
  (point_buffer_url: string, pointBufferID: number, myVR: MyVR): MyVR => {
    console.info(
      `[POINTCLOUD] add pointbuffer ${pointBufferID} url: ${point_buffer_url}`
    )
    const cmd = [
      {
        command: 'requestPointBufferLoad',
        composite: 1,
        layer: Layers.HSPC_POINT_BUFFER,
        url: point_buffer_url,
        'buffer-id': pointBufferID,
        'execute-on-hidden': true,
      },
    ]
    myVR.execute(enc(cmd))
    return myVR
  }
)
export const removePointBuffer = curry(
  (pointBufferID: number, myVR: MyVR): MyVR => {
    console.info(`[POINTCLOUD] remove pointbuffer ${pointBufferID}`)
    const command = {
      command: 'clearBuffer',
      composite: 1,
      layer: Layers.HSPC_POINT_BUFFER,
      'buffer-id': pointBufferID,
      'execute-on-hidden': true,
    }
    myVR.execute(JSON.stringify(command))
    return myVR
  }
)

export const addHSPCTree = curry(
  (hspc_url: string, projection: string, myVR: MyVR): MyVR => {
    console.info(`[POINTCLOUD] add hspc ${hspc_url}`)
    const cmd = [
      {
        command: 'addData',
        composite: 1,
        layer: Layers.HSPC_TREE,
        url: hspc_url,
        'projection-epsg': projection,
        'execute-on-hidden': true,
      },
    ]
    myVR.execute(enc(cmd))
    return myVR
  }
)

export const togglePointcloud = curry((visible: boolean, myVR: MyVR): MyVR => {
  console.info('[POINTCLOUD] toggle pointcloud ', visible)
  const cmd = [
    {
      command: 'setLayerVisible',
      composite: 1,
      layer: Layers.HSPC_TREE,
      visible,
    },
    {
      command: 'setLayerVisible',
      composite: 1,
      layer: Layers.HSPC_POINT_BUFFER,
      visible,
    },
  ]
  myVR.execute(enc(cmd))
  return myVR
})

export const updatePointCloudThickness = curry(
  (thickness: number, myVR: MyVR): MyVR => {
    console.info('[POINTCLOUD] update thickness ', thickness)
    const hasHSPCLayer = haveLayer(Layers.HSPC_TREE, myVR)
    const hasBufferLayer = haveLayer(Layers.HSPC_POINT_BUFFER, myVR)
    const mitigatedThickness = thickness
    const cmdHSPC = hasHSPCLayer
      ? [
          {
            command: 'setRenderOptions',
            composite: 1,
            layer: Layers.HSPC_TREE,
            'clear-depth-before': true,
            'point-size': mitigatedThickness,
          },
        ]
      : []
    const cmdBuffer = hasBufferLayer
      ? [
          {
            command: 'setRenderOptions',
            composite: 1,
            layer: Layers.HSPC_POINT_BUFFER,
            'clear-depth-before': true,
            'point-size': mitigatedThickness,
          },
        ]
      : []
    const cmd = [...cmdHSPC, ...cmdBuffer]
    if (cmd.length) {
      myVR.execute(enc(cmd))
    }
    return myVR
  }
)
