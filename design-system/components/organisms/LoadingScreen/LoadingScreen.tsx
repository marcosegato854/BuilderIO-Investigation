import React, { FC } from 'react'
import style from './LoadingScreen.module.scss'

export interface ILoadingScreenProps {}

/**
 * LoadingScreen description
 */
export const LoadingScreen: FC<ILoadingScreenProps> = () => {
  return <div className={style.container}>LoadingScreen</div>
}
