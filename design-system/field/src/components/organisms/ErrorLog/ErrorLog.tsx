import { Box, Grid } from '@mui/material'
import { FinalAlignmentButton } from 'components/atoms/FinalAlignmentButton/FinalAlignmentButton'
import { ErrorList } from 'components/molecules/ErrorList/ErrorList'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

export const ErrorLog: FC = () => {
  const { t } = useTranslation()
  const onDownloadHandler = () => {}

  return (
    <>
      <Box component="div" mt={1.25} ml={4} mr={4} sx={{ height: '100%' }}>
        <ErrorList />
      </Box>
      <Grid
        container
        pr={4}
        justifyContent="flex-end"
        sx={{
          position: 'sticky',
          bottom: '32px',
        }}
      >
        <Grid item width="200px">
          <FinalAlignmentButton
            icon="Download"
            onClick={onDownloadHandler}
            label={t('settings.error_log_page.button_title', 'download')}
          />
        </Grid>
      </Grid>
    </>
  )
}
