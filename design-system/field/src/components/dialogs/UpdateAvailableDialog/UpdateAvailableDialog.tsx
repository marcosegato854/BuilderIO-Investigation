/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  Box,
  Checkbox,
  Container,
  FormControlLabel,
  FormGroup,
  Stack,
  ThemeProvider,
  Typography,
  alpha,
} from '@mui/material'
import Button from '@mui/material/Button'
import { Icon } from 'components/atoms/Icon/Icon'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { closeDialogAction } from 'store/features/dialogs/slice'
import { setUpdateSettings } from 'store/features/settings/slice'
import { logMessage, selectCheckUpdate } from 'store/features/system/slice'
import { darkTheme, pathDimension } from 'utils/themes/mui'

/**
 * UpdateAvailableDialog alerts the user is an update is available
 */
const UpdateAvailableDialog = () => {
  const { t } = useTranslation()
  const [checked, setChecked] = useState(false)
  const dispatch = useDispatch()
  const { version, changelog, coveredByMaintenance } =
    useSelector(selectCheckUpdate) ?? {}

  const showLicenseExpired = useMemo(
    () => !coveredByMaintenance,
    [coveredByMaintenance]
  )

  const handleOkButton = () => {
    // set the 7 days variable
    dispatch(
      setUpdateSettings({
        hideUpdate: checked,
        checkDate: new Date().toISOString(),
      })
    )
    dispatch(
      logMessage(`[CHECK UPDATE] User set the 7 days variable to: ${checked}`)
    )
    dispatch(closeDialogAction())
  }

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked)
  }

  // PEF 4082: Adjust the height of the dialog to fit the content (Samsung tablet issue with vh)
  useEffect(() => {
    const adjustDialogHeight = () => {
      const dialog = document.getElementById('update-available-dialog')
      const content = document.getElementById('update-available-dialog-content')
      const vh = window.innerHeight
      if (dialog && content) {
        dialog.style.maxHeight = `calc(${vh}px - 48px)`
        content.style.maxHeight = `calc(${vh}px - 144px)`
      }
    }
    adjustDialogHeight()

    window.addEventListener('resize', adjustDialogHeight)

    return () => {
      window.removeEventListener('resize', adjustDialogHeight)
    }
  }, [])

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
          padding: '24px',
        })}
        maxWidth={false}
        fixed={true}
        id="update-available-dialog"
      >
        <Stack
          direction="column"
          alignItems="center"
          textAlign="center"
          gap={0}
          mb={2}
          sx={{ maxHeight: 'calc(100vh - 144px)' }}
          id="update-available-dialog-content"
        >
          <Box
            sx={{
              '& svg': {
                fill: (theme) => theme.colors.primary_11,
              },
            }}
          >
            <Icon name="License" />
          </Box>
          {version && (
            <Typography
              variant="body1"
              data-testid="version-available"
              sx={{
                color: (theme) => theme.colors.primary_11,
                paddingBottom: showLicenseExpired ? '0px' : '8px',
              }}
            >
              {t('checkUpdate.versionAvailable', 'version available!', {
                updateAvailableVersion: version,
              })}
            </Typography>
          )}
          {showLicenseExpired && (
            <Box
              display="flex"
              alignItems="center"
              data-testid="license-expired"
              sx={{
                color: (theme) => theme.colors.secondary_5,
                paddingBottom: '8px',
                '& svg': {
                  width: `${pathDimension(18)}px`,
                  height: `${pathDimension(18)}px`,
                  fill: (theme) => theme.colors.secondary_5,
                  marginRight: '4px',
                },
              }}
            >
              <Icon name="Alert" />
              <Typography variant="body2" textAlign="left">
                {t('checkUpdate.licenseExpired', 'license expired')}
              </Typography>
            </Box>
          )}
          {changelog && (
            <Box
              data-testid="changelog-list"
              sx={{
                maxHeight: '420px',
                width: '100%',
                overflow: 'auto',
                marginBottom: '8px',
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: darkTheme.colors.primary_1,
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: darkTheme.colors.primary_7,
                  borderRadius: '10px',
                },
              }}
            >
              <pre>
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    textAlign: 'left',
                  }}
                >
                  {changelog}
                </Typography>
              </pre>
            </Box>
          )}

          <Typography
            sx={{
              color: (theme) => theme.colors.primary_11,
            }}
            variant="body2"
            textAlign="left"
          >
            {t('checkUpdate.myWorld.title', 'last installer: ')}
          </Typography>
          <Box display="flex" alignItems="center">
            <Button
              variant="text"
              onClick={() =>
                window.open(
                  'https://myworld-portal.leica-geosystems.com/s/en-GB/',
                  '_blank'
                )
              }
              sx={{
                color: (theme) => theme.colors.secondary_8,
                '& svg': {
                  width: `${pathDimension(18)}px`,
                  height: `${pathDimension(18)}px`,
                  fill: (theme) => theme.colors.secondary_8,
                  marginLeft: '4px',
                },
              }}
            >
              <Typography variant="body2" textAlign="left">
                {t('checkUpdate.myWorld.button', 'visit myWorld')}
              </Typography>
              <Icon name="Link" />
            </Button>
          </Box>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
          sx={{ maxHeight: '48px' }}
        >
          <FormGroup>
            <FormControlLabel
              control={<Checkbox onChange={handleOnChange} />}
              data-testid="check-update-checkbox"
              label={
                <Typography variant="body2">
                  {t('checkUpdate.doNotShow', 'do not show for 7 days')}
                </Typography>
              }
            />
          </FormGroup>
          <Button
            type="submit"
            color="primary"
            onClick={() => handleOkButton()}
            data-testid="check-update-ok"
            sx={{
              minWidth: '100px',
              maxHeight: '36px',
            }}
          >
            {t('checkUpdate.okButton', 'ok')}
          </Button>
        </Stack>
      </Container>
    </ThemeProvider>
  )
}
export default UpdateAvailableDialog
