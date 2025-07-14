import classNames from 'classnames'
import style from 'components/atoms/NeededBlock/NeededBlock.module.scss'
import React, { FC, PropsWithChildren, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { selectDataStorageCurrentProject } from 'store/features/dataStorage/slice'
import { FullNeeded, Needed } from 'store/features/planning/types'
import {
  kmToM,
  labelWithUnit,
  mbToGbRnd,
  mtToFt,
  secToH,
  secToMin,
} from 'utils/numbers'
import { hasNeededInfo } from 'utils/planning/plan'

export interface INeededBlockProps {
  needed: Needed | null
  variant?: 'default' | 'bigger'
}

/**
 * NeededBlock description
 */
export const NeededBlock: FC<INeededBlockProps> = ({
  needed,
  variant = 'default',
}: PropsWithChildren<INeededBlockProps>) => {
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const unit = currentProject?.coordinate?.unit
  const { t } = useTranslation()
  const neededFormatted = useMemo(() => {
    if (!hasNeededInfo(needed)) return null
    const fullNeeded = needed as FullNeeded
    const timeValue =
      secToH(fullNeeded.time) >= 1
        ? secToH(fullNeeded.time)
        : secToMin(fullNeeded.time)
    const timeUnit =
      secToH(fullNeeded.time) >= 1
        ? t('side_panel.job.setting.hours', 'h')
        : t('side_panel.job.setting.minutes', 'm')
    const diskValue = mbToGbRnd(Number(fullNeeded.disk))
    const distanceStep = unit === 'imperial' ? 1609 : 1000
    const distanceNeeded =
      fullNeeded.distance > distanceStep
        ? labelWithUnit('KM', kmToM, Number(fullNeeded.distance) / 1000, unit)
        : labelWithUnit('M', mtToFt, Number(fullNeeded.distance), unit)
    return {
      time: `${Math.round(timeValue)} ${timeUnit}`,
      disk: `${diskValue}GB`,
      battery: `${Math.round(Number(fullNeeded.battery))}%`,
      distance: distanceNeeded,
    }
  }, [needed, t, unit])

  if (!neededFormatted) return null
  return (
    <div
      className={classNames({
        [style.rowDetails]: true,
        [style[variant]]: true,
      })}
    >
      <p>
        {t('side_panel.job.setting.time', 'Time needed')}:{' '}
        {neededFormatted.time}
      </p>
      <p>
        {t('side_panel.job.setting.space', 'Space needed')}:{' '}
        {neededFormatted.disk}
      </p>
      {/* HIDDEN UNTIL WE HAVE IT 
      <p>
        {t('side_panel.job.setting.battery', 'Battery needed')}:{' '}
        {neededFormatted.battery}
      </p> */}
      <p>
        {t('side_panel.job.setting.ditance', 'Distance to drive')}:{' '}
        {neededFormatted.distance}
      </p>
    </div>
  )
}
