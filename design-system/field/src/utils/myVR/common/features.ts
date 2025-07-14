import { curry } from 'ramda'
import { enc, haveLayer } from 'utils/myVR/helpers'
import { Layers } from 'utils/myVR/types'
import { toJson } from 'utils/strings'

export const getFeaturePoints = curry(
  (
    callback: (points: Position3D[]) => void,
    featureId: string,
    layerId: Layers,
    myVR: MyVR
  ): MyVR => {
    const result = toJson(
      myVR.execute(
        enc([
          {
            command: 'getObjectPoints',
            composite: 1,
            id: featureId,
            layer: layerId,
          },
        ])
      ),
      'MYVR'
    )
    callback(result)
    return myVR
  }
)

export const memoryHouseKeeping = curry((layerId: Layers, myVR: MyVR): MyVR => {
  const hasLayer = haveLayer(layerId, myVR)
  if (hasLayer) {
    myVR.execute(
      enc([
        {
          command: 'dynamicFeatureMemoryHousekeeping',
          composite: 1,
          layer: layerId,
        },
      ])
    )
  }
  return myVR
})
