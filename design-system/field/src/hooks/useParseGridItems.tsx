/**
 * Hook that returns a function to parse grid items
 * based on GridSettings
 * @returns [IClickableOption[], number]
 */

import { ItemType } from 'components/molecules/CardsGrid/CardsGrid'
import moment from 'moment'
import compose from 'ramda/src/compose'
import curry from 'ramda/src/curry'
import { useMemo } from 'react'
import { GridSortDirection, SortField } from 'store/features/dataStorage/slice'

function filterByName(
  search: string,
  property: 'job' | 'project',
  items: ItemType[]
): ItemType[] {
  if (!search) return items
  return items.filter((i) =>
    i[property]?.name.toLowerCase().includes(search.toLowerCase())
  )
}

function sortByName(
  direction: GridSortDirection,
  property: 'job' | 'project',
  items: ItemType[]
): ItemType[] {
  return items.sort((a, b) => {
    const flipDirection = direction === GridSortDirection.Desc ? -1 : 1
    if (a[property]!.name?.toLowerCase() > b[property]!.name?.toLowerCase())
      return 1 * flipDirection
    if (a[property]!.name?.toLowerCase() < b[property]!.name?.toLowerCase())
      return -1 * flipDirection
    return 0
  })
}

function sortByDate(
  direction: GridSortDirection,
  property: 'job' | 'project',
  dateProperty: 'creationdate' | 'updatedate',
  items: ItemType[]
): ItemType[] {
  return items.sort((a, b) => {
    const flipDirection = direction === GridSortDirection.Asc ? -1 : 1
    // TODO: all this "!" can be removed if we fix the ItemType interface, maybe with an abstract interface
    if (
      moment(a[property]![dateProperty]).isBefore(
        moment(b[property]![dateProperty])
      )
    )
      return 1 * flipDirection
    if (
      moment(a[property]![dateProperty]).isAfter(
        moment(b[property]![dateProperty])
      )
    )
      return -1 * flipDirection
    return 0
  })
}

const parseGridItems = (
  items: ItemType[] = [],
  search: string = '',
  isProject: boolean = true,
  sortField = SortField.CreationDate,
  sortDirection = GridSortDirection.Desc
): ItemType[] => {
  const property = isProject ? 'project' : 'job'
  const filter = curry(filterByName)(search || '')(property)
  let sort
  switch (sortField) {
    case SortField.CreationDate:
      sort = curry(sortByDate)(sortDirection || GridSortDirection.Asc)(
        property
      )('creationdate')
      break
    case SortField.LastModified:
      sort = curry(sortByDate)(sortDirection || GridSortDirection.Asc)(
        property
      )('updatedate')
      break
    case SortField.Name:
    default:
      sort = curry(sortByName)(sortDirection || GridSortDirection.Asc)(property)
      break
  }
  const parseFunc = compose(filter, sort)
  return parseFunc(items)
}

const useParseGridItems = (
  items: ItemType[] = [],
  search: string = '',
  isProject: boolean = true,
  sortField = SortField.CreationDate,
  sortDirection = GridSortDirection.Desc
) => {
  const parsedItemsArray = useMemo(
    () => parseGridItems(items, search, isProject, sortField, sortDirection),
    [items, search, isProject, sortField, sortDirection]
  )
  return parsedItemsArray
}
export default useParseGridItems
