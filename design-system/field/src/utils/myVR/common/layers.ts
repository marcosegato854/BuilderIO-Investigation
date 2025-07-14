import { curry } from 'ramda'
import { enc } from 'utils/myVR/helpers'
import { Layers } from 'utils/myVR/types'

/**
 * remove layer
 */
export const destroyLayer = curry((layer: Layers, myVR: MyVR): MyVR => {
  /** get bounding box */
  const command = [
    {
      command: 'destroyLayer',
      composite: 1,
      layer,
    },
  ]
  myVR.execute(enc(command))
  return myVR
})
