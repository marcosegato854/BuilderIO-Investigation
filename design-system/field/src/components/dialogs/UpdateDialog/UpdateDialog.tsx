/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  Box,
  Container,
  Stack,
  ThemeProvider,
  Typography,
  alpha,
} from '@mui/material'
import Button from '@mui/material/Button'
import { Icon } from 'components/atoms/Icon/Icon'
import { FC, PropsWithChildren, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { closeDialogAction } from 'store/features/dialogs/slice'
import {
  logMessage,
  selectUpdateInfo,
  systemUpdateActionAbort,
  systemUpdateActionStart,
} from 'store/features/system/slice'
import { darkTheme } from 'utils/themes/mui'

/**
 * UpdateDialog allows the user to update PEF
 * After accepting the agreement the update can start
 */
const UpdateDialog = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [acceptAgreement, setAcceptAgreement] = useState(false)
  const [updateStarted, setUpdatedStarted] = useState(false)
  const updateInfo = useSelector(selectUpdateInfo)
  const eula = updateInfo?.eula

  const handleOnClose = () => {
    // TODO maybe in the future the abort action will be implemented
    /* if (updateStarted) {
      dispatch(systemUpdateActionAbort.request())
      dispatch(closeDialogAction())
      dispatch(logMessage('[USER_ACTION] User tried to abort the update'))
    } else {
      dispatch(systemUpdateActionAbort.success())
      dispatch(closeDialogAction())
    } */
    dispatch(systemUpdateActionAbort.success())
    dispatch(closeDialogAction())
  }

  const handleAcceptance = () => {
    dispatch(logMessage('[UPDATE] User agreed with the Licence Agreement'))
    setAcceptAgreement(true)
  }

  const handleOnConfirm = () => {
    setUpdatedStarted(true)
    // start the Update process
    dispatch(systemUpdateActionStart.request())
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
          width: '500px',
          transition: 'all 0.2s ease-in-out',
          padding: '12px',
        })}
        maxWidth={false}
        fixed={true}
      >
        <Stack
          direction="column"
          alignItems="center"
          textAlign="center"
          gap={1}
          mb={2}
        >
          <Box
            sx={{
              '& svg': {
                fill: (theme) => theme.colors.primary_11,
              },
            }}
          >
            <Icon name="Information" />
          </Box>
          <Typography variant="body1" data-testid="update-title">
            {acceptAgreement
              ? t('firmwareUpdate.dialog.title2', 'reboot required')
              : t('firmwareUpdate.dialog.title1', 'license agreement')}
          </Typography>
          <Typography variant="body2" data-testid="update-headline">
            {acceptAgreement
              ? t('firmwareUpdate.dialog.headline2', 'update requires reboot')
              : t('firmwareUpdate.dialog.headline1', 'review license')}
          </Typography>
          {acceptAgreement ? (
            <Typography variant="body2" py={5} data-testid="update-reboot">
              {t(
                'firmwareUpdate.dialog.headline3',
                'after reboot the page will not be available'
              )}
            </Typography>
          ) : (
            <Box
              sx={(theme) => ({
                backgroundColor: theme.colors.primary_9,
                color: theme.colors.primary_1,
                padding: '8px',
                borderRadius: '4px',
                height: '268px',
                overflow: 'hidden',
                position: 'relative',
                width: '100%',
              })}
              data-testid="update-eula"
            >
              {eula && (
                <Box
                  sx={{
                    height: '252px',
                    overflow: 'auto',
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: (theme) => theme.colors.primary_3,
                      borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: (theme) => theme.colors.primary_7,
                      borderRadius: '10px',
                    },
                  }}
                  textAlign="left"
                >
                  <Typography
                    variant="body2"
                    sx={{ pre: { font: 'inherit', whiteSpace: 'pre-wrap' } }}
                  >
                    <pre>{eula}</pre>
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Stack>

        <Stack direction="row" justifyContent="flex-end" gap={2}>
          {!updateStarted && (
            <Button
              variant="outlined"
              color="primary"
              onClick={handleOnClose}
              data-testid="update-cancel"
            >
              {t('firmwareUpdate.dialog.cancel', 'cancel')}
            </Button>
          )}
          {acceptAgreement ? (
            !updateStarted && (
              <Button
                type="submit"
                color="primary"
                onClick={() => handleOnConfirm()}
                data-testid="update-start"
              >
                {t('firmwareUpdate.dialog.yes', 'yes')}
              </Button>
            )
          ) : (
            <Button
              type="submit"
              color="primary"
              onClick={() => handleAcceptance()}
              data-testid="update-agree"
            >
              {t('firmwareUpdate.dialog.agree', 'agree')}
            </Button>
          )}
        </Stack>
      </Container>
    </ThemeProvider>
  )
}
export default UpdateDialog
