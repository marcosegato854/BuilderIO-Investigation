import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import style from 'components/atoms/CameraViewDisabled/CameraViewDisabled.module.scss'
import { useSelector } from 'react-redux'
import useTheme from 'hooks/useTheme'
import { selectSystemState } from 'store/features/system/slice'
import classNames from 'classnames'

/**
 * CameraViewDisabled description
 */
export const CameraViewDisabled = () => {
  const { t } = useTranslation()
  const [theme] = useTheme()
  const systemState = useSelector(selectSystemState)
  const state = systemState?.state

  const showRightControls = useMemo(() => {
    if (!state) return false
    return state !== 'Deactivated'
  }, [state])

  const image =
    theme === 'dark'
      ? '/assets/img/cameraOff_dark.png'
      : '/assets/img/cameraOff_light.png'

  return (
    <div
      data-testid="camera-view-disabled"
      className={classNames({
        [style.container]: true,
        [style.recording]: showRightControls,
      })}
    >
      <img src={image} alt="TRK" />
      <h3 className={style.title}>
        {t('acquisition.camera.disabled', 'Camera disabled')}
      </h3>
    </div>
  )
}
