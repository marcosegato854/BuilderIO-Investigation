import {
  alpha,
  Box,
  Container,
  Stack,
  ThemeProvider,
  Typography,
} from '@mui/material'
import { CloseButton } from 'components/atoms/CloseButton/CloseButton'
import { Icon } from 'components/atoms/Icon/Icon'
import { Unit } from 'components/dialogs/NewProjectForm/NewProjectForm'
import { FC, PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { closeDialogAction } from 'store/features/dialogs/slice'
import { darkTheme, hexToRgb } from 'utils/themes/mui'

const styles = {
  close: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    cursor: 'pointer',
  },
  banner: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 1,
    padding: '2px',
    paddingRight: '6px',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    svg: {
      width: '24px',
      height: '24px',
      path: {
        fill: 'currentColor',
      },
    },
  },
  temperature: {
    flexBasis: '60px',
    textAlign: 'right',
    paddingRight: '8px',
    paddingLeft: '8px',
  },
  temperatureText: {
    flexBasis: '380px',
  },
}

export interface IScannerTemperatureLegendProps {
  unit?: Unit
}

const ScannerTemperatureLegend: FC<IScannerTemperatureLegendProps> = ({
  unit,
}: PropsWithChildren<IScannerTemperatureLegendProps>) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const closeHandler = () => {
    dispatch(closeDialogAction())
  }

  const unitString = unit === Unit.Imperial ? 'tempF' : 'tempC'
  const temperature = {
    high: t(
      `notifications.scannerTemperature.infoDialog.banner1.${unitString}`
    ),
    warning: t(
      `notifications.scannerTemperature.infoDialog.banner2.${unitString}`
    ),
    error: t(
      `notifications.scannerTemperature.infoDialog.banner3.${unitString}`
    ),
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Container
        sx={(theme) => ({
          position: 'relative',
          backgroundColor: alpha(theme.colors.primary_14!.toString(), 0.75),
          color: theme.colors.primary_11,
          backdropFilter: 'blur(10px)',
          borderRadius: '10px',
          width: '530px',
          transition: 'all 0.2s ease-in-out',
          padding: '24px',
        })}
        maxWidth={false}
        fixed={true}
        id="scanner-temperature-dialog"
        data-testid="scanner-temperature-legend"
      >
        <Stack
          direction="column"
          alignItems="center"
          textAlign="center"
          gap={1}
        >
          <Box sx={styles.close}>
            <CloseButton onClick={closeHandler} />
          </Box>
          <Box
            sx={{
              '& svg': {
                fill: (theme) => theme.colors.primary_11,
              },
            }}
          >
            <Icon name="Information" />
          </Box>
          <Box mb={2}>
            <Typography>
              {t(
                'notifications.scannerTemperature.infoDialog.title',
                'scanner temperature'
              )}
            </Typography>
          </Box>
          <Box sx={styles.banner}>
            <Typography
              variant="h5"
              sx={styles.temperature}
              data-testid="scanner-temperature-1"
            >
              {temperature.high}
            </Typography>
            <Typography variant="body2" sx={styles.temperatureText}>
              {t('notifications.scannerTemperature.infoDialog.banner1.text', {
                temperature: temperature.warning,
              })}
            </Typography>
          </Box>
          <Box
            sx={{
              ...styles.banner,
              backgroundColor: (theme) =>
                `rgba(${hexToRgb(theme.colors.secondary_10)}, 0.75)`,
              color: (theme) => theme.colors.primary_1,
            }}
          >
            <Box sx={styles.icon}>
              <Icon name="Warning2" />
            </Box>
            <Typography
              variant="h5"
              sx={styles.temperature}
              data-testid="scanner-temperature-2"
            >
              {temperature.warning}
            </Typography>
            <Typography variant="body2" sx={styles.temperatureText}>
              {t(
                'notifications.scannerTemperature.infoDialog.banner2.text',
                'be careful'
              )}
            </Typography>
          </Box>
          <Box
            sx={{
              ...styles.banner,
              backgroundColor: (theme) =>
                `rgba(${hexToRgb(theme.colors.secondary_5)}, 0.75)`,
              color: (theme) => theme.colors.primary_11,
            }}
          >
            <Box sx={styles.icon}>
              <Icon name="Alert" />
            </Box>
            <Typography
              variant="h5"
              sx={styles.temperature}
              data-testid="scanner-temperature-3"
            >
              {temperature.error}
            </Typography>
            <Typography variant="body2" sx={styles.temperatureText}>
              {t('notifications.scannerTemperature.infoDialog.banner3.text', {
                temperature: temperature.error,
              })}
            </Typography>
          </Box>
        </Stack>
      </Container>
    </ThemeProvider>
  )
}

export default ScannerTemperatureLegend
