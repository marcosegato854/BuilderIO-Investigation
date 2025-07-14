import React, { FC, PropsWithChildren, useState, MouseEvent } from 'react'
import { Icon } from 'components/atoms/Icon/Icon'
import classNames from 'classnames'
import { Fade, Popover, PopoverOrigin } from '@mui/material'
import ContextualHelp, {
  IContextualHelpProps,
} from 'components/dialogs/ContextualHelp/ContextualHelp'
import { useTranslation } from 'react-i18next'
import style from './HelpButton.module.scss'

export interface IHelpButtonProps {
  /**
   * override styles
   */
  className?: string
  /**
   * translation node inside help
   */
  node?: string
  /**
   * info icon?
   * default is question mark
   */
  infoIcon?: boolean
  /**
   * info icon?
   * default is question mark
   */
  position?: 'center' | 'top'
}

/**
 * HelpButton description
 */
export const HelpButton: FC<IHelpButtonProps> = ({
  className,
  node,
  infoIcon = false,
  position = 'center',
}: PropsWithChildren<IHelpButtonProps>) => {
  const [anchorEl, setAnchorEl] = useState<null | SVGSVGElement>(null)
  const open = Boolean(anchorEl)
  const { t } = useTranslation()
  const clickHandler = (e: MouseEvent<SVGSVGElement>) =>
    setAnchorEl(e.currentTarget)
  const close = () => setAnchorEl(null)
  if (!node) return null
  const popoverData: IContextualHelpProps = t(`help.${node}`, {
    returnObjects: true,
  })
  const anchorOrigin: PopoverOrigin =
    position === 'center'
      ? { horizontal: 'center', vertical: 'center' }
      : { horizontal: 'center', vertical: 'top' }
  const transformOrigin: PopoverOrigin =
    position === 'center'
      ? { horizontal: 'center', vertical: 'center' }
      : { horizontal: 'center', vertical: 'bottom' }
  return (
    <>
      {infoIcon ? (
        <Icon
          name="Info"
          className={classNames(style.icon, className)}
          data-testid="help-button"
          onClick={clickHandler}
        />
      ) : (
        <Icon
          name="Help"
          className={classNames(style.icon, className)}
          data-testid="help-button"
          onClick={clickHandler}
        />
      )}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={close}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        TransitionComponent={Fade}
      >
        <ContextualHelp {...popoverData} onClose={close} />
      </Popover>
    </>
  )
}
