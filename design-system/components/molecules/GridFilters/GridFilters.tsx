import React, { FC, PropsWithChildren, useMemo } from 'react'
import { SearchBar } from 'components/atoms/SearchBar/SearchBar'
import { FilterBox } from 'components/atoms/FilterBox/FilterBox'
import { GridSettings } from 'store/features/dataStorage/slice'
import useGridView from 'hooks/useGridView'
import useSortField from 'hooks/useSortField'
import { useTranslation } from 'react-i18next'
import { Grid } from '@mui/material'
import { Icon } from 'components/atoms/Icon/Icon'
import icons from 'components/atoms/Icon/icons'
import style from './GridFilters.module.scss'
import { GridVariant } from '../CardsGrid/CardsGrid'

export interface IGridFiltersProps {
  /**
   * title on the left
   */
  title?: string
  /**
   * initial grid settings (coiming from state)
   */
  gridSettings: GridSettings
  /**
   * callback fired when the user types on the search input
   */
  onSearchChange: (value: string) => void
  /**
   * callback fired when the user changes sorting
   */
  onSortChange: (value: GridSettings) => void
  /**
   * callback fired when the user changes view
   */
  onViewChange: (index: number, option: IClickableOption) => void
}

/**
 * Wraps the filters for JobBrowser and Project Browser grids
 */
export const GridFilters: FC<IGridFiltersProps> = ({
  title = '',
  gridSettings,
  onSearchChange,
  onSortChange,
  onViewChange,
}: PropsWithChildren<IGridFiltersProps>) => {
  const {
    search,
    sortDirection,
    sortField,
    viewBy = GridVariant.GridView,
  } = gridSettings
  const [viewOptions] = useGridView(viewBy)
  const [sortOptions, sortSelectedIndex] = useSortField({
    sortDirection,
    sortField,
  })
  const { t } = useTranslation()

  const [ViewIcon, handleViewChange] = useMemo(() => {
    const iconName: keyof typeof icons =
      viewBy === GridVariant.GridView ? 'List' : 'Grid'
    const targetIndex = viewBy === GridVariant.GridView ? 1 : 0
    return [iconName, () => onViewChange(targetIndex, viewOptions[targetIndex])]
  }, [viewBy, onViewChange, viewOptions])

  /**
   * update the store everytime the search term changes
   * @param newValue new search term
   */
  const handleSearchChange = (newValue: string) => onSearchChange(newValue)

  /**
   * update the store everytime the sorting changes
   * @param newIndex new sorting data
   */
  const handleSortChange = (newIndex: number) =>
    onSortChange(sortOptions[newIndex].value)

  return (
    <div className={style.contentHeader}>
      <Grid container spacing={0}>
        <Grid item xs={3}>
          <h1 className={style.subtitle}>{title}</h1>
        </Grid>
        <Grid item xs={6} className={style.centerColumn}>
          <div className={style.searchBar}>
            <SearchBar onChange={handleSearchChange} initialValue={search} />
          </div>
        </Grid>
        <Grid item xs={3} className={style.rightCollumn}>
          <div className={style.sort}>
            <FilterBox
              options={sortOptions}
              initialSelectedIndex={sortSelectedIndex}
              onChange={handleSortChange}
              title={t('filters.sort_title', 'Sort by:')}
            />
          </div>
          <div className={style.view}>
            <Icon
              name={ViewIcon}
              onClick={handleViewChange}
              data-testid={`test-${viewBy || GridVariant.ListView}`}
            />
          </div>
        </Grid>
      </Grid>
    </div>
  )
}
