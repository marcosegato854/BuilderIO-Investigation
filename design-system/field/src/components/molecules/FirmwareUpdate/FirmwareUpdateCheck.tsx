import { Button, CircularProgress, Grid, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { Icon } from 'components/atoms/Icon/Icon'
import { LicenseGrid } from 'components/molecules/FirmwareUpdate/FirmwareUpdate'
import { t } from 'i18n/config'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectCheckUpdate,
  selectCheckUpdateError,
  selectInternetIsActive,
  systemCheckUpdateActions,
} from 'store/features/system/slice'
import { darkTheme, pathDimension } from 'utils/themes/mui'

export const FirmwareUpdateCheck = () => {
  const dispatch = useDispatch()
  const { version, newUpdate, changelog, coveredByMaintenance } =
    useSelector(selectCheckUpdate) ?? {}
  const internetIsActive = useSelector(selectInternetIsActive)
  const checkUpdateError = useSelector(selectCheckUpdateError)
  const [showLoader, setShowLoader] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const showLicenseExpired = useMemo(
    () => !coveredByMaintenance,
    [coveredByMaintenance]
  )

  const handleCheckUpdate = () => {
    setShowLoader(true)
    console.info('[CHECK UPDATE] user requested a check update')
    dispatch(systemCheckUpdateActions.request({ userRequest: true }))
  }

  useEffect(() => {
    if (version || !internetIsActive || checkUpdateError) {
      setShowLoader(false)
      setShowResults(true)
    }
  }, [checkUpdateError, internetIsActive, version])

  // resets the component when it is mounted and unmounted
  useEffect(() => {
    setShowResults(false)
    return () => {
      setShowResults(false)
    }
  }, [])

  /**
   * This handles the case where a new update is available
   * @returns component
   */
  const NewUpdate = () => {
    return (
      <Grid item data-testid="check-update-available">
        <Typography
          variant="body1"
          data-testid="available-version"
          sx={{
            color: darkTheme.colors.primary_11,
            paddingBottom: showLicenseExpired ? '0px' : '8px',
          }}
        >
          {t('checkUpdate.versionAvailable', 'version available!', {
            updateAvailableVersion: version,
          })}
        </Typography>
        {showLicenseExpired && (
          <Box
            display="flex"
            alignItems="center"
            data-testid="license-expired"
            sx={{
              color: darkTheme.colors.secondary_5,
              paddingBottom: '8px',
              '& svg': {
                width: `${pathDimension(18)}px`,
                height: `${pathDimension(18)}px`,
                fill: darkTheme.colors.secondary_5,
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
              maxHeight: '100px',
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
        <Box display="flex" alignItems="center" data-testid="myworld-cta">
          <Button
            variant="contained"
            onClick={() =>
              window.open(
                'https://myworld-portal.leica-geosystems.com/s/en-GB/',
                '_blank'
              )
            }
            sx={{
              color: darkTheme.colors.primary_1,
              '& svg': {
                width: `${pathDimension(14)}px`,
                height: `${pathDimension(14)}px`,
                fill: darkTheme.colors.primary_1,
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
      </Grid>
    )
  }

  /**
   * This handles the case where an update erreur occured
   * @returns component
   */
  const UpdateError = () => {
    return (
      <Grid item data-testid="check-update-error">
        <Box
          display="flex"
          alignItems="center"
          sx={{
            color: darkTheme.colors.secondary_5,
            '& svg': {
              width: `${pathDimension(18)}px`,
              height: `${pathDimension(18)}px`,
              fill: darkTheme.colors.secondary_5,
              marginRight: '4px',
            },
          }}
        >
          <Icon name="Alert" />
          <Box>
            <Typography variant="body2" textAlign="left">
              {t('checkUpdate.error', 'error')}
            </Typography>
            <Typography
              variant="body2"
              textAlign="left"
              onClick={() => handleCheckUpdate()}
              data-testid="retry-button"
              sx={{
                cursor: 'pointer',
              }}
            >
              {t('checkUpdate.retry', 'click to retry')}
            </Typography>
          </Box>
        </Box>
      </Grid>
    )
  }

  /**
   * This handles the case where there's no internet
   * @returns component
   */
  const NoInternet = () => {
    return (
      <Grid item data-testid="check-update-noInternet">
        <Box
          display="flex"
          alignItems="center"
          sx={{
            color: darkTheme.colors.secondary_5,
            '& svg': {
              width: `${pathDimension(18)}px`,
              height: `${pathDimension(18)}px`,
              fill: darkTheme.colors.secondary_5,
              marginRight: '4px',
            },
          }}
        >
          <Icon name="Alert" />
          <Typography variant="body2" textAlign="left">
            {t('checkUpdate.noInternet', 'no internet')}
          </Typography>
        </Box>
      </Grid>
    )
  }

  /**
   * This handles the case where there's no update
   * @returns component
   */
  const UpToDate = () => {
    return (
      <Grid item data-testid="check-update-uptodate">
        <Typography variant="body1" sx={{ color: darkTheme.colors.primary_11 }}>
          {t('checkUpdate.uptodate', 'up to date')}
        </Typography>
        <Typography
          variant="body2"
          textAlign="left"
          onClick={() => handleCheckUpdate()}
          data-testid="check-button"
          sx={{
            cursor: 'pointer',
          }}
        >
          {t('checkUpdate.checkButton', 'click to check')}
        </Typography>
      </Grid>
    )
  }

  /**
   * This handles the result of the check update
   * @returns component
   */
  const UpToDateChecked = () => {
    return (
      <Grid item data-testid="check-update-uptodate-checked">
        <Box
          display="flex"
          alignItems="center"
          sx={{
            color: darkTheme.colors.primary_11,
            '& svg': {
              width: `${pathDimension(18)}px`,
              height: `${pathDimension(18)}px`,
              marginRight: '4px',
              path: {
                fill: '#92FF20',
              },
            },
          }}
        >
          <Icon name="Completed2" />
          <Typography variant="body1" textAlign="left">
            {t('checkUpdate.uptodate', 'up to date')}
          </Typography>
        </Box>
      </Grid>
    )
  }

  /**
   * This handles the loading component
   * @returns component
   */
  const UpdateLoader = () => {
    return (
      <Grid item data-testid="check-update-loader">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CircularProgress size={16} />
          <Typography
            variant="body1"
            sx={{ color: darkTheme.colors.primary_11 }}
          >
            {t('checkUpdate.checking', 'checking')}
          </Typography>
        </Box>
      </Grid>
    )
  }

  const CheckUpdateComponent = () => {
    if (version && newUpdate) return <NewUpdate />
    if (!internetIsActive) return <NoInternet />
    if (showLoader) return <UpdateLoader />
    if (checkUpdateError) return <UpdateError />
    if (showResults) return <UpToDateChecked />
    return <UpToDate />
  }

  return (
    <LicenseGrid
      container
      direction="column"
      alignItems="flex-start"
      width="500px"
      data-testid="check-update-component"
    >
      <CheckUpdateComponent />
    </LicenseGrid>
  )
}
