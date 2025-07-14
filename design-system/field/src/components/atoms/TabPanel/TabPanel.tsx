import React, { FC, PropsWithChildren } from 'react'

export interface ITabPanelProps {
  children?: React.ReactNode
  value?: number
  index: number
  cssClass?: string
  padding?: number
}

/**
 * TabPanel description
 */
export const TabPanel: FC<ITabPanelProps> = ({
  children,
  value,
  index,
  cssClass,
  padding = 3,
}: PropsWithChildren<ITabPanelProps>) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      className={cssClass}
    >
      {value === index && children}
    </div>
  )
}
