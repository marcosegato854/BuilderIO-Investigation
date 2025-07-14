import { CircularProgress, Fade } from '@mui/material'
import style from 'components/atoms/ProgressOverlay/ProgressOverlay.module.scss'
import React, { FC, PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'

export interface IProgressOverlayProps {
  /**
   * display the component
   */
  display: boolean
  /**
   * current progress
   */
  progress?: number
  /**
   * custom message
   */
  message?: string
}

/**
 * ProgressOverlay description
 */
export const ProgressOverlay: FC<IProgressOverlayProps> = ({
  display,
  progress,
  message,
}: PropsWithChildren<IProgressOverlayProps>) => {
  const { t } = useTranslation()
  // if (!display) return null
  return (
    <Fade in={display} timeout={{ enter: 1000, exit: 1000 }}>
      <div className={style.loading} data-testid="progress-overlay">
        <CircularProgress />
        {progress && progress >= 0 ? (
          <div>{`Loading (${Math.max(progress, 0)}%)`}</div>
        ) : (
          <div>{message || t('loading', 'loading')}</div>
        )}
      </div>
    </Fade>
  )
}
