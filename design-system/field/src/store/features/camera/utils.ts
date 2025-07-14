import { CameraGroup } from 'store/features/camera/types'

export const filterActiveCameraGroups = (groups: CameraGroup[]) =>
  groups.reduce((stack, cameraGroup) => {
    const newCameraGroup = {
      ...cameraGroup,
      cameras: cameraGroup.cameras.filter((cd) => cd.active),
    }
    // eslint-disable-next-line no-param-reassign
    if (newCameraGroup.cameras.length) stack = [...stack, newCameraGroup]
    return stack
  }, [] as CameraGroup[])

export const filterInactiveCameraGroups = (groups: CameraGroup[]) =>
  groups.reduce((stack, cameraGroup) => {
    const newCameraGroup = {
      ...cameraGroup,
      cameras: cameraGroup.cameras.filter((cd) => cd.active === false),
    }
    // eslint-disable-next-line no-param-reassign
    if (newCameraGroup.cameras.length) stack = [...stack, newCameraGroup]
    return stack
  }, [] as CameraGroup[])
