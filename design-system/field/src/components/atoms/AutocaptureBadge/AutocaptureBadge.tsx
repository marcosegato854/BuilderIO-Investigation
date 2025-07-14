import { Typography } from '@mui/material'
import { FC, PropsWithChildren, useMemo } from 'react'
import { darkTheme } from 'utils/themes/mui'

export interface IAutocaptureBadgeProps {
  /**
   * is recording
   */
  recording: boolean
  /**
   * autocapture enabled
   */
  autocaptureEnabled: boolean

  variant?: 'webapp' | 'pcuapp'
}

/**
 * AutocaptureBadge description
 */
export const AutocaptureBadge: FC<IAutocaptureBadgeProps> = ({
  recording,
  autocaptureEnabled,
  variant = 'webapp',
}: PropsWithChildren<IAutocaptureBadgeProps>) => {
  const label = useMemo(() => {
    if (recording) {
      if (autocaptureEnabled) {
        return 'A'
      } else {
        return 'M'
      }
    }
    if (autocaptureEnabled) {
      return 'Automatic'
    }
    return 'Manual'
  }, [autocaptureEnabled, recording])

  const computedFontSize = useMemo(() => {
    if (variant === 'pcuapp') return '18px'
    if (recording) return '1.4rem'
    return '1rem'
  }, [variant, recording])
  return (
    <Typography
      fontSize={computedFontSize}
      sx={{
        color: darkTheme.colors.primary_11,
      }}
      noWrap
    >
      {label}
    </Typography>
  )
}
