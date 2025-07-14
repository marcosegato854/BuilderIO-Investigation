import { t } from 'i18n/config'
import { identity, replace } from 'ramda'
import {
  CameraDetails,
  CameraGroup,
  CameraTrigger,
  CameraTriggerResponse,
} from 'store/features/camera/types'
import { labelWithUnit, mtToFt } from 'utils/numbers'

export function getCameraId(camera: CameraDetails): string {
  return camera.name.split(' ').join('').toLowerCase()
}

export function translateCameraName(
  group: CameraGroup,
  camera: CameraDetails,
  leftCameraOrientation: 'landscape' | 'portrait' | undefined,
  rightCameraOrientation: 'landscape' | 'portrait' | undefined
): string {
  const rotatingGroups = ['Left', 'Right']
  const ns = replace(' ', '_')
  if (rotatingGroups.includes(group.name)) {
    /** replace spaces with underscores */
    const orientation =
      (group.name === 'Left'
        ? leftCameraOrientation
        : rightCameraOrientation) || 'unknown'
    return t(
      `acquisition.camera.names.${ns(group.name)}.${ns(
        camera.name
      )}.${orientation}`,
      camera.name
    )
  }
  return t(
    `acquisition.camera.names.${ns(group.name)}.${ns(camera.name)}`,
    camera.name
  )
}

export function cameraTriggerFromResponse(
  response: CameraTriggerResponse
): CameraTrigger {
  return {
    // type: cond([
    //   [equals('Distance'), always(1)],
    //   [equals('Elapse'), always(2)],
    //   [T, always(0)],
    // ])(response.type) as CameraTrigger['type'],
    type: response.type,
    distance: response.space,
    elapse: response.time,
  }
}

export function getCameraEnableDescription(
  camera: CameraInfo,
  unit: Coordinate['unit']
) {
  const parts = []
  parts.push(
    t(
      `new_job_form.option.camera.${Number(camera.enable) > 0 ? 'on' : 'off'}`,
      camera.enable?.toString()
    ).toUpperCase()
  )
  if (camera.enable !== 0) {
    parts.push(': ')
    if (camera.enable === 1) {
      parts.push(labelWithUnit('M', mtToFt, camera.distance, unit))
    }
    if (camera.enable === 2) {
      parts.push(labelWithUnit('MS', identity, camera.elapse, unit))
    }
  }
  return parts.join('')
}
