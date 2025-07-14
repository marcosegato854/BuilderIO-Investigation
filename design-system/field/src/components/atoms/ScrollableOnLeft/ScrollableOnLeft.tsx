import React, { FC, PropsWithChildren } from 'react'
import style from './ScrollableOnLeft.module.scss'

export interface IScrollableOnLeftProps {}

/**
 * Wrapper that makes its content scrollable. Also the scrollbar appears on the left side.
 */
export const ScrollableOnLeft: FC<IScrollableOnLeftProps> = ({
  children,
}: PropsWithChildren<IScrollableOnLeftProps>) => {
  return <div className={style.scrollableOnLeft}>{children}</div>
}
