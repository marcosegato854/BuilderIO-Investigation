import { Box, Button, CircularProgress, Grid, Typography } from '@mui/material'
import { Icon } from 'components/atoms/Icon/Icon'
import { prop, uniqBy } from 'ramda'
import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectUpdatePrepareStatus,
  systemUpdatePrepareActionStart,
} from 'store/features/system/slice'
import { translateError } from 'utils/errors'
import { darkTheme } from 'utils/themes/mui'
import style from './FirmwareUpdate.module.scss'

export const Prerequisites: FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [isError, setIsError] = useState(false)
  const [isNotValidError, setIsNotValidError] = useState(false)
  const prerequisitesInfo = useSelector(selectUpdatePrepareStatus)
  const prerequisitesStatus = prerequisitesInfo?.status
  const prerequisitesTitle = prerequisitesInfo?.description
  // codes can be sent multiple times, so we filter them
  const prerequisitesError = useMemo(() => {
    if (prerequisitesInfo?.errors)
      return uniqBy(prop('code'), prerequisitesInfo?.errors)
  }, [prerequisitesInfo?.errors])

  const prerequisitesErrorTitle = useMemo(() => {
    if (prerequisitesError && prerequisitesError?.length > 0) {
      const errorCodes = prerequisitesError?.map((error) => error.code)
      if (
        [
          'UPD-101',
          'UPD-102',
          'UPD-103',
          'UPD-104',
          'UPD-105',
          'UPD-106',
        ].includes(prerequisitesError[0].code)
      ) {
        return `${t(
          'firmwareUpdate.systemError',
          'system error'
        )} (${errorCodes})`
      } else if (
        [
          'UPD-201',
          'UPD-202',
          'UPD-203',
          'UPD-204',
          'UPD-205',
          'UPD-206',
          'UPD-301',
          'UPD-302',
          'UPD-401',
          'UPD-402',
          'UPD-502',
          'UPD-504',
          'UPD-506',
          'UPD-501',
          'UPD-503',
          'UPD-505',
        ].includes(prerequisitesError[0].code)
      ) {
        setIsNotValidError(true)
        return `${t(
          'firmwareUpdate.softwareError',
          'software error'
        )} (${errorCodes})`
      }
    }
    // else if (
    //   ['UPD-501', 'UPD-503', 'UPD-505'].includes(prerequisitesError[0].code)
    // )
    //   return t('firmwareUpdate.notSafeError', 'not safe error')
    return t('firmwareUpdate.genericError', 'prerequisites error')
  }, [prerequisitesError, t])

  const prerequisitesProgress = useMemo(() => {
    if (prerequisitesInfo?.progress && prerequisitesInfo?.progress < 0) return 0
    return prerequisitesInfo?.progress
  }, [prerequisitesInfo?.progress])

  useMemo(() => {
    setIsError(prerequisitesStatus === 'error')
  }, [prerequisitesStatus])

  const onRetryClick = () => {
    dispatch(systemUpdatePrepareActionStart.request())
  }

  return (
    <>
      <Grid
        item
        display="flex"
        flexDirection="row"
        alignItems="center"
        columnGap={1}
        data-testid="prerequisites-result"
      >
        {!isError ? (
          <>
            <CircularProgress
              size="20px"
              data-testid="progress-prerequisites"
            />
            <Box display="flex" flexDirection="column" columnGap={1}>
              <Typography variant="body1" data-testid="prerequisites-title">
                {prerequisitesProgress}% {prerequisitesTitle}
              </Typography>
              <Typography variant="caption">
                {t('firmwareUpdate.notUnplugStorage', 'not unplug usb')}
              </Typography>
            </Box>
          </>
        ) : (
          <>
            <Icon name="Error" className={style.prerequisites__error} />
            <Typography
              variant="body1"
              color={darkTheme.colors.secondary_5}
              data-testid="prerequisites-error-title"
            >
              {prerequisitesErrorTitle}
            </Typography>
          </>
        )}
      </Grid>
      {isError && (
        <>
          <Grid item>
            <Box
              component="ul"
              sx={{ paddingLeft: '24px' }}
              data-testid="errors-list"
            >
              {isNotValidError ? (
                <li key="novalid-error">
                  <Typography
                    variant="body2"
                    color={darkTheme.colors.secondary_5}
                  >
                    {t('firmwareUpdate.downloadAgain', 'downlaod again')}
                  </Typography>
                </li>
              ) : (
                prerequisitesError?.map((error) => {
                  if (error.description !== '')
                    return (
                      <li key={error.code || 0}>
                        <Typography
                          variant="body2"
                          color={darkTheme.colors.secondary_5}
                        >
                          {translateError(error)}
                        </Typography>
                      </li>
                    )
                  return null
                })
              )}
            </Box>
          </Grid>
          <Grid item>
            <Button
              color="primary"
              onClick={onRetryClick}
              data-testid="retry-button"
            >
              {t('firmwareUpdate.retry', 'Retry')}
            </Button>
          </Grid>
        </>
      )}
    </>
  )
}
