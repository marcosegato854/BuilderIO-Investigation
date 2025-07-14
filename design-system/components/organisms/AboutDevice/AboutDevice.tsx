import { FC } from 'react'
import { Divider, Grid, Typography, styled, useTheme } from '@mui/material'
import { selectSystemInfo } from 'store/features/system/slice'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

const AboutDeviceLabel = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
}))

export const AboutDevice: FC = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const systemInfo = useSelector(selectSystemInfo)
  const serialNumber = systemInfo?.serial
  const softwareVersion = systemInfo?.softwareversion
  // const softwareAvailable = systemInfo?.softwareavailable
  const systemType = systemInfo?.systemtype
  const windowsVersion = systemInfo?.windowsversion
  const product = systemInfo?.product
  const aboutDeviceDivider = (
    <Divider
      data-testid="divider"
      orientation="horizontal"
      sx={{ backgroundColor: theme.colors.primary_11 }}
    />
  )
  return (
    <Grid
      container
      component="div"
      direction="column"
      spacing="10px"
      borderRadius="10px"
      mt={1.25}
      ml={4}
      mr={4}
      sx={{
        width: 'auto',
        padding: '24px',
        paddingTop: '14px',
        backgroundColor: theme.colors.primary_3,
      }}
    >
      {serialNumber && (
        <>
          <Grid item data-testid="serial-number-about">
            <AboutDeviceLabel>
              {t('settings.about_device_page.serial_number', 'serial number')}
            </AboutDeviceLabel>
            <AboutDeviceLabel>{serialNumber}</AboutDeviceLabel>
          </Grid>
          <Grid item>{aboutDeviceDivider}</Grid>
        </>
      )}
      {softwareVersion && (
        <>
          <Grid item data-testid="software-version-about">
            <AboutDeviceLabel>
              {t(
                'settings.about_device_page.software_version',
                'software version'
              )}
            </AboutDeviceLabel>
            <AboutDeviceLabel>{softwareVersion}</AboutDeviceLabel>
          </Grid>
          <Grid item>{aboutDeviceDivider}</Grid>
        </>
      )}
      {/* {softwareAvailable && (
        <>
          <Grid item data-testid="software-available-about">
            <AboutDeviceLabel>
              {t(
                'settings.about_device_page.software_available',
                'software available'
              )}
            </AboutDeviceLabel>
            <AboutDeviceLabel>{softwareAvailable}</AboutDeviceLabel>
          </Grid>
          <Grid item>{aboutDeviceDivider}</Grid>
        </>
      )} */}
      {systemType && (
        <>
          <Grid item data-testid="system-type-about">
            <AboutDeviceLabel>
              {t('settings.about_device_page.system_type', 'system type')}
            </AboutDeviceLabel>
            <AboutDeviceLabel>{systemType}</AboutDeviceLabel>
          </Grid>
          <Grid item>{aboutDeviceDivider}</Grid>
        </>
      )}
      {windowsVersion && (
        <>
          <Grid item data-testid="windows-version-about">
            <AboutDeviceLabel>
              {t(
                'settings.about_device_page.windows_version',
                'windows version'
              )}
            </AboutDeviceLabel>
            <AboutDeviceLabel>{windowsVersion}</AboutDeviceLabel>
          </Grid>
          <Grid item>{aboutDeviceDivider}</Grid>
        </>
      )}
      {product && (
        <Grid item data-testid="product-about">
          <AboutDeviceLabel>
            {t('settings.about_device_page.product', 'product')}
          </AboutDeviceLabel>
          <AboutDeviceLabel>{product}</AboutDeviceLabel>
        </Grid>
      )}
    </Grid>
  )
}
