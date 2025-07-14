import { useMemo } from 'react'
import { GridSortDirection, SortField } from 'store/features/dataStorage/slice'
import { equals } from 'ramda'
import { useTranslation } from 'react-i18next'

/**
 * Hook that handles grid view switching
 * @returns [IClickableOption[], number]
 */
const useSortField = (sort: {
  sortField?: SortField
  sortDirection?: GridSortDirection
}): [IClickableOption[], number] => {
  const { t } = useTranslation()
  const sortWithDefualts = useMemo(
    () => ({
      sortField: sort.sortField || SortField.CreationDate,
      sortDirection: sort.sortDirection || GridSortDirection.Desc,
    }),
    [sort]
  )
  const sortOptions: IClickableOption[] = useMemo(
    () => [
      {
        label: t('filters.sort_options.name_asc.label', 'name_asc'),
        value: {
          sortField: SortField.Name,
          sortDirection: GridSortDirection.Asc,
        },
      },
      {
        label: t('filters.sort_options.name_desc.label', 'name_desc'),
        value: {
          sortField: SortField.Name,
          sortDirection: GridSortDirection.Desc,
        },
      },
      {
        label: t('filters.sort_options.date_asc.label', 'date_asc'),
        value: {
          sortField: SortField.CreationDate,
          sortDirection: GridSortDirection.Asc,
        },
      },
      {
        label: t('filters.sort_options.date_desc.label', 'date_desc'),
        value: {
          sortField: SortField.CreationDate,
          sortDirection: GridSortDirection.Desc,
        },
      },
      {
        label: t('filters.sort_options.last_mod.label', 'last_mod'),
        value: {
          sortField: SortField.LastModified,
          sortDirection: GridSortDirection.Asc,
        },
      },
    ],
    [t]
  )
  const sortSelectedIndex = useMemo(
    () => sortOptions.findIndex((o) => equals(o.value, sortWithDefualts)),
    [sortOptions, sortWithDefualts]
  )
  return [sortOptions, sortSelectedIndex]
}
export default useSortField
