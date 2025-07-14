import { Fade, Tooltip, styled } from '@mui/material'
import classNames from 'classnames'
import { FC, MouseEventHandler, useMemo } from 'react'
import style from './SingleTool.module.scss'

export interface ISingleToolProps {
  /**
   * Button onClick event
   */
  onClick: MouseEventHandler<HTMLElement>
  /**
   * Icon inside the button
   */
  icon?: JSX.Element
  /**
   * disabled
   */
  disabled?: boolean
  /**
   * transparent
   */
  transparent?: boolean
  /**
   * tooltipMessage
   */
  tooltipMessage?: string
  /**
   * selected
   */
  selected?: boolean
  /**
   * data-testid
   */
  dataTestId?: string
}

/* custom MUI Tooltip */
const SingleToolTooltip = styled(Tooltip)(({ theme }) => ({
  '& .MuiTooltip-arrow': {
    color: theme.colors.primary_10,
  },
  '& .MuiTooltip-tooltip': {
    backgroundColor: theme.colors.primary_10,
    color: theme.colors.primary_11,
    padding: '8px 16px',
    fontSize: '14px',
  },
}))

/**
 * Squared button with an icon
 */
export const SingleTool: FC<ISingleToolProps> = ({
  onClick,
  icon,
  disabled,
  transparent,
  selected,
  tooltipMessage,
  dataTestId,
}) => {
  const showTooltip = useMemo(() => {
    if (!tooltipMessage) return false
    return undefined
  }, [tooltipMessage])

  return (
    <>
      <SingleToolTooltip
        title={tooltipMessage || "shouldn't see this"}
        open={showTooltip}
        arrow
        TransitionComponent={Fade}
      >
        <button
          className={classNames({
            [style.singleTool]: true,
            [style.disabled]: disabled,
            [style.transparent]: transparent,
            [style.selected]: selected,
          })}
          onClick={onClick}
          type="button"
          data-testid={dataTestId}
        >
          {icon}
        </button>
      </SingleToolTooltip>
      {/* <Popper id="tooltip" open={open} anchorEl={anchorEl}>
        <div>The content of the Popper.</div>
      </Popper> */}
    </>
  )
}
