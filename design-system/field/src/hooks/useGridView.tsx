import { GridVariant } from 'components/molecules/CardsGrid/CardsGrid'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Hook that handles grid view switching
 * @returns [IClickableOption[], number]
 */
const useGridView = (viewBy?: GridVariant): [IClickableOption[], number] => {
  const { t } = useTranslation()
  const viewOptions: IClickableOption[] = useMemo(
    () => [
      {
        label: t('filters.view_options.gallery.label', 'gallery'),
        value: GridVariant.GridView,
      },
      {
        label: t('filters.view_options.list.label', 'list'),
        value: GridVariant.ListView,
      },
    ],
    [t]
  )
  const viewSelectedIndex = useMemo(
    () => viewOptions.findIndex((o) => o.value === viewBy),
    [viewOptions, viewBy]
  )
  return [viewOptions, viewSelectedIndex]
}
export default useGridView
