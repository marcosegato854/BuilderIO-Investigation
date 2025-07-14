import React, {
  ChangeEvent,
  FC,
  PropsWithChildren,
  useCallback,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from 'components/atoms/Icon/Icon'
import style from './SearchBar.module.scss'

export interface ISearchBarProps {
  /**
   * Initial value
   */
  initialValue?: string
  /**
   * Custom placeholder
   */
  customPlaceholder?: string
  /**
   * Disables the input so the user cannot change its value
   */
  disabled?: boolean
  /**
   * Callback called when the user changes the value
   */
  onChange?: (value: string) => void
}

/**
 * Search input for the user
 */
export const SearchBar: FC<ISearchBarProps> = ({
  initialValue = '',
  customPlaceholder,
  disabled = false,
  onChange,
}: PropsWithChildren<ISearchBarProps>) => {
  const [value, setValue] = useState<string>(initialValue)
  const { t } = useTranslation()
  const placeholder =
    customPlaceholder || t('header.searchbarPlaceholder', 'Search')

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value
      setValue(newValue)
      onChange && onChange(event.target.value)
    },
    [setValue, onChange]
  )
  return (
    <div className={style.container}>
      <input
        type="text"
        className={style.container__searchBar}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        data-testid="search-input"
      />
      <Icon name="Search" className={style.container__icon} />
    </div>
  )
}
