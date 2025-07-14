import React, { FC, useMemo } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import style from 'pages/NotFound/NotFound.module.scss'

export interface INotFoundProps extends RouteComponentProps {}

/**
 * NotFound description
 */
export const NotFound: FC<INotFoundProps> = ({ history }: INotFoundProps) => {
  const name = useMemo(
    () =>
      history.location.pathname
        .substring(1, history.location.pathname.length)
        .replace('/', ''),
    [history]
  )
  return (
    <div className={style.container}>
      <h1>{name} NotFound</h1>
    </div>
  )
}
