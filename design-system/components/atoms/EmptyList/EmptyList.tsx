import style from 'components/atoms/EmptyList/EmptyList.module.scss'
import { RedPlusMobileButton } from 'components/atoms/RedPlusMobileButton/RedPlusMobileButton'
import useTheme from 'hooks/useTheme'
import React, { FC, MouseEventHandler, PropsWithChildren, useMemo } from 'react'

export interface IEmptyListProps {
  title: string
  subtitle: string
  onClickNew?: MouseEventHandler<HTMLElement>
  isProject: boolean
}

const PegasusDark = '/assets/img/PegasusDark.svg'
const PegasusLight = '/assets/img/PegasusLight.svg'
const City = '/assets/img/City.png'
const CityLight = '/assets/img/CityLight.svg'

/**
 * EmptyList description
 */
export const EmptyList: FC<IEmptyListProps> = ({
  title,
  subtitle,
  onClickNew,
  isProject,
}: PropsWithChildren<IEmptyListProps>) => {
  const [theme] = useTheme()

  const Image = useMemo(() => {
    if (isProject) return theme === 'dark' ? City : CityLight
    return theme === 'dark' ? PegasusDark : PegasusLight
  }, [theme, isProject])

  return (
    <div className={style['contentMain--empty']}>
      <img className={style.image} src={Image} alt="" />
      <h1 className={style.title}>{title}</h1>
      <p className={style.subtitle}>{subtitle}</p>
      {onClickNew && <RedPlusMobileButton onClick={onClickNew} />}
    </div>
  )
}
