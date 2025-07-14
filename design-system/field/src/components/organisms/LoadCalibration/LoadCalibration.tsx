import { Box, Button, styled } from '@mui/material'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

const CalibrationButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.colors.secondary_5,
  color: theme.colors.primary_18,
  width: '320px',
  height: '40px',
  borderRadius: '8px',
  ...theme.typography.body1,
  '&:hover': {
    backgroundColor: theme.colors.secondary_5,
    color: theme.colors.primary_18,
  },
}))

export const LoadCalibration: FC = () => {
  const { t } = useTranslation()
  const onClickLoadHandler = () => {}

  return (
    <Box
      component="div"
      sx={{ height: '100%' }}
      display="flex"
      alignItems="flex-end"
      justifyContent="center"
    >
      <CalibrationButton
        onClick={onClickLoadHandler}
        sx={{ marginBottom: '32px' }}
        data-testid="calibration-button"
      >
        {t('settings.calibration_page.button_title', 'Load Calibration File')}
      </CalibrationButton>
    </Box>
  )
}
