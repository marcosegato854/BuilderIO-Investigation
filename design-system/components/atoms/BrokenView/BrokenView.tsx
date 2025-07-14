import React, { FC, PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@mui/material'
import { Icon } from 'components/atoms/Icon/Icon'
import style from './BrokenView.module.scss'

export interface IBrokenViewProps {
  message?: string
  action?: {
    onClick: Function
    label: string
  }
}

/**
 * BrokenView description
 */
export const BrokenView: FC<IBrokenViewProps> = ({
  message,
  action,
}: PropsWithChildren<IBrokenViewProps>) => {
  const { t } = useTranslation()
  return (
    <div className={style.container}>
      <div className={style.header}>
        <p className={style.pegasus}>{t('header.pegasus', 'pegasus')}</p>
      </div>
      <div className={style.satellite}>
        {/* Themeing cannot be used as a hook, due to the high level of the ErrorBoundary */}
        <Icon name="SatelliteLight" className={style.satelliteLight} />
        <Icon name="SatelliteDark" className={style.satelliteDark} />
      </div>
      <div className={style.footer}>
        {message && <div className={style.message}>{message}</div>}
        {action && (
          <div className={style.cta}>
            <Button
              classes={{ root: style.ctaBtn }}
              onClick={() => action.onClick()}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
