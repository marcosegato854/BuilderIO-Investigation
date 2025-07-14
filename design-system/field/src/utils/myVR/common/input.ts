import { curry } from 'ramda'
import { mMap } from 'utils/myVR/common/mMapInputHandler'

export enum MyVRUserInputType {
  SINGLE_TAP_EVENT = 1, // !< A single tap has occured.
  DOUBLE_TAP_EVENT = 2, // !< A double tap has occured.
  MOVE_EVENT = 3, // !< A move gesture has occured.
  ZOOM_EVENT = 4, // !< A zoom gesture has occured.
  ROTATE_EVENT = 5, // !< A rotate gesture has occured.
  TILT_EVENT = 6, // !< A tilt gesture has occured.
  NO_CONTACT_EVENT = 7, // !< No contact left on the device.
  CONTACT_EVENT = 8, // !< A contact has occured.
}
export interface MyVRInputEventHandler {
  (
    compositeId: number,
    type: MyVRUserInputType,
    x: number,
    y: number,
    dX: number,
    dY: number,
    value: number
  ):
    | boolean
    | {
        x?: number
        y?: number
        dX?: number
        dY?: number
        value?: number
      }
}
export const addInputHandler = curry(
  (gate: MyVRInputEventHandler | null, myVR: MyVR): MyVR => {
    // eslint-disable-next-line new-cap, no-unused-vars, @typescript-eslint/no-unused-vars
    const inputHandler = new mMap.inputHandler(myVR.canvas, gate, myVR)
    console.info('[MYVR] added input handler')
    return myVR
  }
)
