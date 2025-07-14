import { Chip } from '@mui/material'
import { FC, useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  selectClientReleaseTag,
  selectSystemInfo,
} from 'store/features/system/slice'

/**
 * DevChip description
 */
export const DevChip: FC = () => {
  const systemInfo = useSelector(selectSystemInfo)
  const releaseTagClient = useSelector(selectClientReleaseTag)
  const releaseTagServer = systemInfo?.softwareBuildType

  const isDevelop = useMemo(
    () => [releaseTagClient, releaseTagServer].includes('Develop'),
    [releaseTagClient, releaseTagServer]
  )
  if (isDevelop)
    return (
      <Chip
        label="DEV"
        size="small"
        sx={{ backgroundColor: (theme) => theme.colors.secondary_8 }}
      />
    )
  return null
}
