import { IDetail } from 'components/atoms/ItemDetails/ItemDetails'
import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { getDetails } from 'utils/jobs'

/**
 * Hook that handles the data of a job details overlay
 */
const useItemDetails = (
  currentProject: IProject | IJob | null,
  unit: 'metric' | 'imperial'
): [
  HTMLLIElement | null | undefined,
  Dispatch<SetStateAction<HTMLLIElement | null | undefined>>,
  IDetail[],
  ((event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void) | undefined
] => {
  const [detailsMenuItem, setDetailsMenuItem] = useState<HTMLLIElement | null>()
  const popoverCloseHandler = useCallback(() => {
    setDetailsMenuItem(null)
  }, [setDetailsMenuItem])
  const details = getDetails(currentProject, unit)
  return [detailsMenuItem, setDetailsMenuItem, details, popoverCloseHandler]
}
export default useItemDetails
