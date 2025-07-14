import { curry } from 'ramda'
import { MapsConfig, MapsCountry } from 'store/features/system/types'
import { tilesUrl } from 'utils/here/hereMaps'
import { enc } from 'utils/myVR/helpers'
import { MyVRCommandObject, Layers } from 'utils/myVR/types'

export const setMapTileStyle = curry(
  (
    style: 'dark' | 'light' | 'satellite',
    mapsConfig: MapsConfig,
    mapsCountry: MapsCountry,
    myVR: MyVR
  ): MyVR => {
    const command: MyVRCommandObject = {
      command: 'configure',
      composite: 1,
      layer: Layers.TILE_MAP_SERVICE,
      servers: [
        {
          urls: [tilesUrl(mapsConfig, mapsCountry, style)],
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
)

export const refreshTiles = (myVR: MyVR): MyVR => {
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
