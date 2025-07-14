/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, MouseEventHandler } from 'react'
import style from 'components/atoms/Gdpr/Gdpr.module.scss'

/**
 * Gdpr description
 */
export const Gdpr: FC = () => {
  const clickHandler: MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    window.open('/assets/documents/gdpr.pdf')
    return false
  }
  return (
    <div data-testid="gdpr" className={style.container} onClick={clickHandler}>
      Gdpr
    </div>
  )
}
