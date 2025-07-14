/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, useState, useEffect, useMemo } from 'react'
import { Fade, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { Icon } from 'components/atoms/Icon/Icon'
import style from './DiskSelectBox.module.scss'

export interface IDiskSelectBoxProps {
  /**
   * Value of the field
   */
  value?: string | number
  /**
   * Array of options
   */
  options: Array<IOptionDisk>
  /**
   * disable the component
   */
  disabled?: boolean
  /**
   * Onchange function
   */
  onChange?: (newValue: string) => void
}

/**
 * DiskSelectBox description
 */
export const DiskSelectBox: FC<IDiskSelectBoxProps> = ({
  value,
  options,
  disabled,
  onChange,
}: IDiskSelectBoxProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let to: NodeJS.Timeout
    const cleanup = () => {
      if (to) clearTimeout(to)
    }
    cleanup()

    to = setTimeout(() => {
      try {
        setMounted(true)
      } catch (error) {
        console.error(error)
      }
    }, 1000)
    return cleanup
  }, [])

  useEffect(() => {
    if (!value) return

    const correspondingIndex = options.findIndex((option) => {
      return option.value === value
    })

    if (correspondingIndex === -1) return

    setSelectedIndex(correspondingIndex)
  }, [value, options])

  const handleClick: React.MouseEventHandler<HTMLLIElement> = (
    e: React.MouseEvent<HTMLLIElement>
  ) => {
    const target = e.currentTarget
    const index = Number(target.getAttribute('data-index'))

    if (isNaN(index)) return

    setSelectedIndex(index)
    onChange && onChange(options[index].value)
  }

  const tooltipText = useMemo(
    () => t('new_project_form.tooltip.full_disk', 'Disk space is full'),
    [t]
  )

  return (
    <div className={style.openSelectbox} data-testid="disk-select">
      <ul
        className={classNames({
          [style.list]: true,
          [style.itemDisabled]: disabled,
        })}
      >
        {options.map((option, index) => {
          return (
            <Tooltip
              PopperProps={{
                disablePortal: true,
              }}
              open={option.critical && mounted}
              title={tooltipText}
              arrow
              placement="bottom"
              key={`option-${option.value}`}
              TransitionComponent={Fade}
            >
              <li
                data-testid="disk-select-entry"
                data-index={index}
                className={classNames({
                  [style.item]: true,
                  [style.itemSelected]: index === selectedIndex,
                  [style.itemSingle]: options.length === 1,
                  [style.itemDouble]: options.length === 2,
                })}
                onClick={disabled ? undefined : handleClick}
              >
                <span>{option.label}</span>
                {option.critical && (
                  <Icon name="Warning" className={style.itemWarning} />
                )}
              </li>
            </Tooltip>
          )
        })}
      </ul>
    </div>
  )
}
