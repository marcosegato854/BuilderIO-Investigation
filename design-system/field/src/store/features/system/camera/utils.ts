import { t } from 'i18n/config'

export const getDisconnectedCameraMessage = (
  isActive: boolean,
  isRecording: boolean
) => {
  if (isRecording)
    return t(
      'acquisition.deactivated_camera.text_recording',
      'Camera disconnected'
    )
  if (isActive)
    return t(
      'acquisition.deactivated_camera.text_active',
      'Camera disconnected'
    )
  return t('acquisition.deactivated_camera.text_default', 'Camera disconnected')
}

export const getDisconnectedCameraOkLabel = (
  isActive: boolean,
  isRecording: boolean
) => {
  if (isRecording) return t('acquisition.deactivated_camera.ok_recording', 'OK')
  if (isActive) return t('acquisition.deactivated_camera.ok_active', 'OK')
  return t('acquisition.deactivated_camera.ok_default', 'OK')
}

export const getDisconnectedCameraCancelLabel = (
  isActive: boolean,
  isRecording: boolean
) => {
  if (isRecording)
    return t('acquisition.deactivated_camera.cancel_recording', 'Cancel')
  return undefined
}

export const getReconnectedCameraMessage = (
  isActive: boolean,
  isRecording: boolean,
  readyToRecord: boolean,
  hasDisconnectedCameras: boolean
) => {
  if (isRecording && !hasDisconnectedCameras)
    return t('acquisition.reactivated_camera.text_all', 'Camera reconnected')
  if (readyToRecord && isActive && !hasDisconnectedCameras)
    return t('acquisition.reactivated_camera.text_resume', 'Camera reconnected')
  if (hasDisconnectedCameras)
    return t('acquisition.reactivated_camera.text_some', 'Camera reconnected')
  return t('acquisition.reactivated_camera.text_default', 'Camera reconnected')
}

export const getReconnectedCameraOkLabel = (
  isActive: boolean,
  isRecording: boolean,
  hasDisconnectedCameras: boolean
) => {
  if (isRecording && !hasDisconnectedCameras)
    return t('acquisition.reactivated_camera.ok_all', 'OK')
  if (isActive) return t('acquisition.reactivated_camera.ok_active', 'OK')
  return t('acquisition.reactivated_camera.ok_default', 'OK')
}

export const getReconnectedCameraCancelLabel = (
  isActive: boolean,
  isRecording: boolean,
  hasDisconnectedCameras: boolean
) => {
  if (isRecording && !hasDisconnectedCameras) return undefined
  if (isActive && !hasDisconnectedCameras)
    return t('acquisition.reactivated_camera.cancel_all', 'Cancel')
  return undefined
}
