import React, { SVGProps, forwardRef, LegacyRef } from 'react'
// import style from 'components/atoms/Icon/Icon.module.scss'
import icons from './icons'

export interface IIconProps extends SVGProps<SVGSVGElement> {
  name: keyof typeof icons
}

/**
 * Icon description
 */
export const Icon = forwardRef<SVGSVGElement, IIconProps>(
  ({ name, ...svgProps }: IIconProps, ref?: LegacyRef<SVGSVGElement>) => {
    const SelectedIcon = icons[name]
    if (SelectedIcon) {
      if (ref) return <SelectedIcon {...svgProps} ref={ref} />
      return <SelectedIcon {...svgProps} />
    }
    return null
  }
)
