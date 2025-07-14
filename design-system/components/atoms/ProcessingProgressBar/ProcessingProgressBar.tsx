import { Box, LinearProgress, Stack } from '@mui/material'

import { FC, PropsWithChildren, useMemo } from 'react'
import { JobProcessStatus } from 'store/features/dataStorage/types'
import { darkTheme } from 'utils/themes/mui'

export interface IProcessingProgressBarProps {
  progress?: number
  label?: string
  status?: JobProcessStatus
}

/**
 * ProcessingProgressBar description
 */
export const ProcessingProgressBar: FC<IProcessingProgressBarProps> = ({
  progress = 0,
  label,
  status,
}: PropsWithChildren<IProcessingProgressBarProps>) => {
  const progressColor = useMemo(() => {
    if (status === JobProcessStatus.DONE) return darkTheme.colors.secondary_4
    if (status === JobProcessStatus.PLAY) return darkTheme.colors.secondary_3
    if (status === JobProcessStatus.PAUSE) return darkTheme.colors.primary_18
    return darkTheme.colors.secondary_7
  }, [status])

  const progressBuffer = useMemo(() => {
    if (progress > 0 && progress < 100) return '4px 0px 0px rgba(0,0,0,.5)'
    return '0px 0px 0px rgba(0,0,0,.5)'
  }, [progress])

  return (
    <Stack
      data-testid="processing-progress-bar"
      sx={{ ...darkTheme.typography.caption }}
    >
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 8,
          '& .MuiLinearProgress-colorPrimary': {
            backgroundColor: darkTheme.colors.primary_24,
          },
          '& .MuiLinearProgress-bar': {
            borderRadius: 8,
            backgroundColor: progressColor,
            boxShadow: progressBuffer,
          },
        }}
      />

      <Stack
        direction="row"
        spacing={2}
        py="4px"
        sx={{
          justifyContent: 'space-between',
          color: darkTheme.colors.primary_11,
        }}
      >
        <Box>{label}</Box>
        {status !== JobProcessStatus.ERROR && progress > 0 && (
          <Box>{progress}%</Box>
        )}
      </Stack>
    </Stack>
  )
}
