/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  Fade,
  Menu,
  MenuItem,
  MenuProps,
  ThemeProvider,
  styled,
} from '@mui/material'
import classNames from 'classnames'
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { hexToRgb, lightTheme } from 'utils/themes/mui'
import style from './FilterBox.module.scss'

export interface IFilterBoxProps {
  /**
   * Array of IClickableOption that represent the options in the dropdown
   */
  options: IClickableOption[]
  /**
   * Disables user interaction
   */
  disabled?: boolean
  /**
   * prefix to the current value
   */
  title?: string
  /**
   * Initial selection
   */
  initialSelectedIndex?: number
  /**
   * Callback called at every user selection that returns: (index,IClickableOption)
   */
  onChange?: (index: number, value: IClickableOption) => void
}

const FilterMenu = styled(Menu)<MenuProps>(({ theme }) => ({
  '& .MuiMenu-paper': {
    backgroundColor: `rgba(${hexToRgb(theme.colors.primary_12)}, 0.65)`,
    borderRadius: '10px',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  '& .MuiMenu-list': {
    padding: 0,
  },
  '& .MuiMenuItem-root': {
    padding: '15px 16px',
    color: theme.colors.primary_1,
    ...theme.typography.buttonLabel,
  },
  '& .MuiMenuItem-root:nth-of-type(2n)': {
    borderBottom: `1px solid rgba(${hexToRgb(theme.colors.primary_1)}, 0.1)`,
  },
}))

/**
 * Dropdown menu
 */
export const FilterBox: FC<IFilterBoxProps> = ({
  options = [],
  disabled = false,
  title,
  initialSelectedIndex = 0,
  onChange,
}: PropsWithChildren<IFilterBoxProps>) => {
  const [showOptionsList, setShowOptionsList] = useState<Boolean>(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(
    Math.max(initialSelectedIndex, 0)
  )
  const { t } = useTranslation()
  const filterBtn = useRef<HTMLDivElement>(null)

  const handleListDisplay = useCallback(() => {
    if (disabled) return
    setShowOptionsList(!showOptionsList)
  }, [disabled, showOptionsList])

  // This method handles the setting of name in select text area
  // and list display on selection
  const handleOptionClick: React.MouseEventHandler<HTMLLIElement> = (event) => {
    const newValue = Number(
      (event.target as HTMLLIElement).getAttribute('data-index')
    )
    if (isNaN(newValue)) return
    setSelectedIndex(newValue)
    onChange && onChange(newValue, options[newValue])
    setShowOptionsList(false)
  }

  const selectedItem = useMemo(
    () => options[selectedIndex],
    [selectedIndex, options]
  )

  return (
    <div
      className={style.filterBox}
      onClick={handleListDisplay}
      data-testid="open-button"
      ref={filterBtn}
    >
      <span className={style.title} data-disabled={disabled}>
        {title || t('filters.title', 'Filter by:')}
      </span>
      <div
        className={classNames({
          [style.selector]: true,
          [style.active]: showOptionsList,
        })}
        data-disabled={disabled}
      >
        <span className={style['option--selected']}>{selectedItem?.label}</span>
      </div>
      {/* if the showOptionsList state is true, show the hidden list */}
      {/* {showOptionsList && (
          <ul className={style.optionList} data-test="option-list">
            {options.map((option, index) => {
              return (
                <li
                  className={style.option}
                  data-index={index}
                  key={option.label}
                  onClick={handleOptionClick}
                >
                  {option.label}
                </li>
              )
            })}
          </ul>
        )} */}
      <ThemeProvider theme={lightTheme}>
        <FilterMenu
          elevation={0}
          keepMounted
          open={!!showOptionsList}
          // getContentAnchorEl={null}
          anchorEl={filterBtn.current}
          data-testid="option-list"
          className={style.menu}
          TransitionComponent={Fade}
        >
          <span className={style.menuOrderTitle}>
            {t('filters.order', 'order')}
          </span>
          {options.map((option, index) => (
            <MenuItem
              key={option.label}
              data-index={index}
              onClick={handleOptionClick}
              selected={option.label === selectedItem?.label}
              data-testid="option-list-element"
            >
              {option.label}
            </MenuItem>
          ))}
        </FilterMenu>
      </ThemeProvider>
    </div>
  )
}
