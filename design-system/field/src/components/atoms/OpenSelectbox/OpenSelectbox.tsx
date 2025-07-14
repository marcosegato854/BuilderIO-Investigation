/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, useState, useEffect } from 'react'
import classNames from 'classnames'
import { isNil } from 'ramda'
import style from 'components/atoms/OpenSelectbox/OpenSelectbox.module.scss'

export interface IOpenSelectboxProps {
  /**
   * Value of the field
   */
  value?: string | number
  /**
   * Array of options
   */
  options: Array<IOption>
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
 * OpenSelectbox description
 */
export const OpenSelectbox: FC<IOpenSelectboxProps> = ({
  value,
  options,
  disabled,
  onChange,
}: IOpenSelectboxProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  useEffect(() => {
    if (isNil(value)) return
    const correspondingIndex = options.findIndex((option) => {
      return option.value === value
    })
    if (correspondingIndex === -1) {
      setSelectedIndex(0)
      return
    }
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

  return (
    <div className={style.openSelectbox}>
      <ul
        className={classNames({
          [style.list]: true,
          [style.listDisabled]: disabled,
        })}
      >
        {options.map((option, index) => {
          return (
            <li
              key={`option-${option.value}`}
              data-index={index}
              data-testid="selectbox-option"
              className={classNames({
                [style.item]: true,
                [style.itemSelected]: index === selectedIndex,
                [style.itemDisabled]: disabled,
              })}
              onClick={disabled ? undefined : handleClick}
            >
              {option.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
