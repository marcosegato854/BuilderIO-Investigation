import { enc } from 'utils/myVR/helpers'
import { MyVRFunctor } from 'utils/myVR/types'

export const destroyAllLayers: MyVRFunctor = (myVR: MyVR) => {
  const cmd = {
    command: 'destroyAllLayer',
    composite: 1,
  }
  myVR.execute(enc(cmd))
  return myVR
}

export const destroyComposite: MyVRFunctor = (myVR: MyVR) => {
  const cmd = {
    command: 'destroyComposite',
    composite: 1,
  }
  myVR.execute(enc(cmd))
  return myVR
}

export const destroy: MyVRFunctor = (myVR: MyVR) => {
  // destroyAllLayers(myVR) // not needed, should be handled by myVR.destroy()
  // destroyComposite(myVR) // not needed, should be handled by myVR.destroy()
  // registerGlobalCallback(null, myVR)
  // addInputHandler(null, myVR)
  myVR.destroy()
  console.info('[MYVR] destroyed')
  return myVR
}
