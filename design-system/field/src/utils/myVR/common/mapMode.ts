import { curry } from 'ramda'
import { getPositionAtCenter, enc } from 'utils/myVR/helpers'
import { MapMode, MyVRCommandObject, Layers } from 'utils/myVR/types'

export const setMapMode = curry((mapMode: MapMode, myVR: MyVR): MyVR => {
  const currentPosition = getPositionAtCenter(myVR)
  let command: MyVRCommandObject[] = [
    {
      command: 'setInputType',
      composite: 1,
      layer: Layers.MAP,
      type: 2,
    },
    {
      command: 'configure',
      composite: 1,
      layer: Layers.MAP3D_INPUT,
      type: 2,
      // "yaw-input-factor": 0.4, // Input event will be multiplied by this factor before changing yaw. Used to change yaw sensitivity and to invert yaw control (if negative).
      // "pitch-input-factor": 0.4,
      'min-pitch': mapMode === MapMode.MAP_2D ? 0 : 45,
      'max-pitch': mapMode === MapMode.MAP_2D ? 0 : 85,
    },
  ]
  // TODO: this is required to adjust the view, otherwise it will remain unchanged until the user interacts
  if (currentPosition) {
    command = [
      ...command,
      {
        command: 'setPosition',
        composite: 1,
        layer: Layers.MAP3D_INPUT,
        latitude: Number(currentPosition.latitude),
        longitude: Number(currentPosition.longitude),
        // "time": 2000, // this could animate the movement but doesn't work with the car and it's bumpy in 2d mode
      },
    ]
  }
  myVR.execute(enc(command))
  return myVR
})
