import style from 'components/atoms/HereCopyright/HereCopyright.module.scss'
import moment from 'moment'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { selectTilesCopyright } from 'store/features/position/slice'

/**
 * HereCopyright description
 */
export const HereCopyright: FC = () => {
  const copyInfo = useSelector(selectTilesCopyright)
  const { t } = useTranslation()

  const text = useMemo(() => {
    const year = moment().format('YYYY')
    const textArr = [`© ${year} HERE`]
    if (copyInfo?.label) textArr.push(`, ${copyInfo.label}`)
    return textArr.join('')
  }, [copyInfo])
  return (
    <div className={style.container} data-testid="here-copyright">
      <a
        target="_blank"
        href={t('mapView.here.copyright.$link', '#')}
        rel="noopener noreferrer"
      >
        {t('mapView.here.copyright.terms', 'terms')}
      </a>
      <span>{text}</span>
    </div>
  )
}
