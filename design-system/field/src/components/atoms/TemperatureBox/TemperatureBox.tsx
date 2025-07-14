import { Box, Paper, Typography, useTheme } from '@mui/material'
import { width } from '@mui/system'
import { Icon } from 'components/atoms/Icon/Icon'
import { Unit } from 'components/dialogs/NewProjectForm/NewProjectForm'
import { FC, PropsWithChildren, useMemo } from 'react'
import { TemperatureStatus } from 'store/features/scanner/types'
import { darkTheme, hexToRgb } from 'utils/themes/mui'

export interface ITemperatureBoxProps {
  temperature: number
  status: TemperatureStatus
  label: string
  unit?: Unit
}

const styles = {
  paper: {
    width: 'fit-content',
    backgroundColor: 'transparent',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    svg: {
      width: '24px',
      height: '24px',
    },
  },
  boxContainer: {
    display: 'flex',
    width: 'fit-content',
    padding: 1,
    gap: 1,
    alignItems: 'center',
    borderRadius: 1,
  },
  boxTemperature: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: 1,
    padding: '0 4px',
  },
}

export const TemperatureBox: FC<ITemperatureBoxProps> = ({
  temperature,
  status,
  label,
  unit,
}: PropsWithChildren<ITemperatureBoxProps>) => {
  const theme = useTheme()
  const convertedTemperature = useMemo(
    () =>
      unit === Unit.Imperial
        ? `${((temperature * 9) / 5 + 32).toFixed(1)} °F`
        : `${temperature.toFixed(1)} °C`,
    [temperature, unit]
  )

  const backgroundColor = useMemo(() => {
    switch (status) {
      case TemperatureStatus.Error:
        return `rgba(${hexToRgb(theme.colors.secondary_5)}, 0.75)`
      case TemperatureStatus.Warning:
        return `rgba(${hexToRgb(theme.colors.secondary_10)}, 0.75)`
      default:
        return `rgba(${hexToRgb(theme.colors.primary_1)}, 0.85)`
    }
  }, [status, theme.colors])

  const fontColor = useMemo(() => {
    switch (status) {
      /* we need to keep the white text in the case of error */
      case TemperatureStatus.Error:
        return darkTheme.colors.primary_11
      /* we need to keep the black text in the case of warning */
      case TemperatureStatus.Warning:
        return darkTheme.colors.primary_1
      default:
        return theme.colors.primary_11
    }
  }, [status, theme.colors])

  const boxColor = useMemo(() => {
    switch (status) {
      case TemperatureStatus.Error:
        return `rgba(${hexToRgb(theme.colors.secondary_5)}, 1)`
      case TemperatureStatus.Warning:
        return `rgba(${hexToRgb(theme.colors.secondary_10)}, 1)`
      default:
        return `rgba(${hexToRgb(theme.colors.secondary_4)}, 1)`
    }
  }, [status, theme.colors])

  const ShowIcon = useMemo(() => {
    switch (status) {
      case TemperatureStatus.Error:
        return <Icon name={'Alert'} />
      case TemperatureStatus.Warning:
        return <Icon name={'Warning2'} />
      default:
        return null
    }
  }, [status])

  return (
    <Paper elevation={3} sx={styles.paper}>
      <Box
        sx={{
          ...styles.boxContainer,
          backgroundColor: backgroundColor,
          color: fontColor as string,
          svg: {
            path: {
              fill: fontColor as string,
            },
          },
        }}
      >
        {ShowIcon && (
          <Box sx={styles.icon} data-testid="temperature-alert-icon">
            {ShowIcon}
          </Box>
        )}
        <Typography data-testid="temperature-label">{label}</Typography>
        <Box sx={{ ...styles.boxTemperature, backgroundColor: boxColor }}>
          <Typography>{convertedTemperature}</Typography>
        </Box>
      </Box>
    </Paper>
  )
}
