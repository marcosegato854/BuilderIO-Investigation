/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, PropsWithChildren, useMemo } from 'react'
import SatelliteView from 'assets/png/SatelliteView.png'
import MapView from 'assets/png/MapView.png'
import { useTranslation } from 'react-i18next'
import style from './SatelliteButton.module.scss'

export interface ISatelliteButtonProps {
  /**
   * click handler
   */
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void
  /**
   * is satellite or map
   */
  satellite?: boolean
}

/**
 * SatelliteButton description
 */
export const SatelliteButton: FC<ISatelliteButtonProps> = ({
  satellite = true,
  onClick,
}: PropsWithChildren<ISatelliteButtonProps>) => {
  const { t } = useTranslation()
  const TilesIcon = useMemo(() => {
    return satellite ? MapView : SatelliteView
  }, [satellite])
  const TilesText = useMemo(() => {
    return satellite
      ? t('mapView.map', 'map')
      : t('mapView.satellite', 'satellite')
  }, [satellite, t])
  return (
    <div className={style.container} onClick={onClick}>
      <img
        className={style.satelliteView}
        src={TilesIcon}
        alt="satellite view"
        data-testid="satellite-view"
      />
      <div className={style.text}>{TilesText}</div>
    </div>
  )
}
