import {
  Box,
  Button,
  Container,
  Divider,
  Fade,
  Grid,
  Popover,
  Stack,
  Typography,
  alpha,
  styled,
} from '@mui/material'
import { Icon } from 'components/atoms/Icon/Icon'
import { FirmwareUpdateCheck } from 'components/molecules/FirmwareUpdate/FirmwareUpdateCheck'
import moment from 'moment'
import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectReadyToUpdate,
  selectSystemInfo,
  selectUpdateInfo,
  selectUpdatePrepareStatus,
  systemUpdatePrepareActionStart,
} from 'store/features/system/slice'
import { darkTheme, pathDimension } from 'utils/themes/mui'
import style from './FirmwareUpdate.module.scss'
import { Prerequisites } from './Prerequisites'

export interface IFirmwareUpdateProps {
  onClose?: () => void
}

export const LicenseGrid = styled(Grid)(() => ({
  backgroundColor: darkTheme.colors.primary_3,
  borderRadius: '10px',
  padding: '16px 24px',
  gap: '10px',
}))

/**
 * FirmwareUpdate description
 */
export const FirmwareUpdate: FC<IFirmwareUpdateProps> = ({
  onClose,
}: PropsWithChildren<IFirmwareUpdateProps>) => {
  const anchorEl = document.getElementById('hamburgerMenu')
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const systemInfo = useSelector(selectSystemInfo)
  const updateInfo = useSelector(selectUpdateInfo)
  const prerequisitesInfo = useSelector(selectUpdatePrepareStatus)
  const updateChangeLog = updateInfo?.changelog
  const updateLastDate = updateInfo?.lastDate
  const updateVersionAvailable = updateInfo?.version
  const ccp = systemInfo?.license?.field.eid
  const expireDate = systemInfo?.license?.field.maintenanceExpiryDate
  const firmwareVersion = updateInfo?.lastVersion
  const isUSBDetected = updateInfo?.usbConnected
  const suSerial = systemInfo?.sensorUnit?.serial
  const suModel = systemInfo?.product
  const pcuSerial = systemInfo?.serial
  const updateAvailableVersion = updateInfo?.version
  const prerequisitesStatus = prerequisitesInfo?.status
  const readyToUpdate = useSelector(selectReadyToUpdate)
  const [showUpdateHowTo, setShowUpdateHowTo] = useState(false)

  const isCheckingPrerequisites = useMemo(() => {
    if (prerequisitesStatus)
      return ['progress', 'error', 'accepted'].includes(prerequisitesStatus)
    return false
  }, [prerequisitesStatus])

  const updateDate = useMemo(() => {
    if (updateLastDate) {
      const unformattedDate = moment(new Date(updateLastDate)).format('l LTS')
      const formattedDate = unformattedDate.replace('/', '-').replace('/', '-')
      return formattedDate
    }
    return
  }, [updateLastDate])

  const isUpdateAvailable = useMemo(() => {
    if (updateVersionAvailable) {
      return !(updateVersionAvailable.length === 0)
    }
    return false
  }, [updateVersionAvailable])

  const showCheckUpdate = useMemo(() => {
    return !(isUpdateAvailable && !!updateAvailableVersion)
  }, [isUpdateAvailable, updateAvailableVersion])

  const onUpdateClick = () => {
    dispatch(systemUpdatePrepareActionStart.request())
  }

  const handleHowToUpdateClick = () => {
    setShowUpdateHowTo(!showUpdateHowTo)
  }

  useEffect(() => {
    if (readyToUpdate && onClose) onClose()
  }, [onClose, readyToUpdate])

  return (
    <Popover
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      anchorEl={anchorEl}
      onClose={onClose}
      open
      TransitionComponent={Fade}
    >
      <Container
        sx={{
          position: 'relative',
          backgroundColor: alpha(darkTheme.colors.primary_14!.toString(), 0.5),
          color: darkTheme.colors.primary_11,
          backdropFilter: 'blur(10px)',
          maxWidth: 'sm',
          borderRadius: '10px',
          transition: 'all 0.2s ease-in-out',
          padding: '12px',
        }}
      >
        <Box
          component="div"
          sx={{
            height: '22px',
            width: '22px',
            position: 'absolute',
            top: '5px',
            right: '10px',
            cursor: 'pointer',
            backgroundColor: alpha(darkTheme.colors.primary_1!.toString(), 0.5),
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            svg: { path: { fill: darkTheme.colors.primary_11 } },
          }}
          className={style.closeicon}
        >
          <Icon name="Close" onClick={onClose} />
        </Box>
        {!showUpdateHowTo && (
          <Stack
            direction="column"
            alignItems="stretch"
            justifyContent="center"
            gap={1}
            data-testid="firmware-update"
          >
            <Stack
              alignItems="center"
              sx={{
                color: 'inherit',
                textAlign: 'center',
                padding: '12px',
                svg: { path: { fill: darkTheme.colors.primary_11 } },
              }}
              className={style.headericon}
            >
              {isUpdateAvailable ? (
                <Icon name="UpdateAvailable" />
              ) : (
                <Icon name="License" />
              )}
              <Typography variant="body1" sx={{ ...darkTheme.typography.bold }}>
                {t('firmwareUpdate.header', 'license & software update')}
              </Typography>
            </Stack>

            {(ccp || expireDate) && (
              <LicenseGrid container alignItems="center">
                {ccp && (
                  <Grid item xs={6} sm={6}>
                    <Typography variant="body1">
                      {t('firmwareUpdate.ccp', 'ccp license number')}
                      {/* // "ccp": "Licence ID", */}
                    </Typography>
                    <Typography variant="body2">{ccp}</Typography>
                  </Grid>
                )}
                {expireDate && (
                  <>
                    <Grid item>
                      <Divider
                        orientation="vertical"
                        variant="middle"
                        sx={{
                          height: 32,
                          bgcolor: '#ffffff',
                          strokeWidth: 1,
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <Typography variant="body1">
                        {t('firmwareUpdate.expire', 'expire date')}
                        {/* "expire": "Customer care package expiry date", */}
                      </Typography>
                      <Typography variant="body2">{expireDate}</Typography>
                    </Grid>
                  </>
                )}
              </LicenseGrid>
            )}
            {(suSerial || pcuSerial) && (
              <LicenseGrid container alignItems="center">
                <Grid item xs={6}>
                  <Typography variant="body1">
                    {t('firmwareUpdate.su', 'su')}
                  </Typography>
                  {suSerial ? (
                    <>
                      <Typography variant="body2">{suModel}</Typography>
                      <Typography variant="body2">{suSerial}</Typography>
                    </>
                  ) : (
                    <Typography variant="body2" data-testid="no-su-attached">
                      ---
                    </Typography>
                  )}
                </Grid>
                {pcuSerial && (
                  <>
                    <Grid item>
                      <Divider
                        orientation="vertical"
                        variant="middle"
                        sx={{
                          height: 32,
                          bgcolor: '#ffffff',
                          strokeWidth: 1,
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <Typography variant="body1">
                        {t('firmwareUpdate.pcu', 'pcu')}
                      </Typography>
                      <Typography variant="body2">{pcuSerial}</Typography>
                    </Grid>
                  </>
                )}
              </LicenseGrid>
            )}
            {showCheckUpdate && <FirmwareUpdateCheck />}
            {isUpdateAvailable && updateAvailableVersion ? (
              <LicenseGrid
                container
                direction="column"
                alignItems="flex-start"
                width="500px"
              >
                <Grid item data-testid="update-detected">
                  <Typography
                    variant="body1"
                    sx={{
                      color: darkTheme.colors.secondary_8,
                      paddingBottom: '8px',
                    }}
                  >
                    {t(
                      'firmwareUpdate.versionAvailable',
                      'version available!',
                      {
                        updateAvailableVersion: updateAvailableVersion,
                      }
                    )}
                  </Typography>
                  {updateChangeLog && (
                    <Box
                      data-testid="changelog-list"
                      sx={{
                        maxHeight: '120px',
                        overflow: 'auto',
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
                          }}
                        >
                          {updateChangeLog}
                        </Typography>
                      </pre>
                    </Box>
                  )}
                </Grid>
                {isCheckingPrerequisites ? (
                  <Prerequisites />
                ) : (
                  <Grid item>
                    <Button
                      color="primary"
                      onClick={onUpdateClick}
                      data-testid="update-now-button"
                    >
                      {t('firmwareUpdate.updateNow', 'update now')}
                    </Button>
                  </Grid>
                )}
              </LicenseGrid>
            ) : (
              <LicenseGrid
                container
                alignItems="center"
                width="500px"
                data-testid="update-guidelines"
                gap={1}
              >
                <Grid item>
                  {isUSBDetected && (
                    <Typography
                      variant="body1"
                      data-testid="no-installer-label"
                    >
                      {t(
                        'firmwareUpdate.noInstallerDetected',
                        'no installer detected'
                      )}
                    </Typography>
                  )}
                  {!isUSBDetected && (
                    <Typography variant="body1" data-testid="no-storage-label">
                      {t(
                        'firmwareUpdate.noStorageDetected',
                        'no storage device detected'
                      )}
                    </Typography>
                  )}
                </Grid>
              </LicenseGrid>
            )}
            {firmwareVersion && updateDate && (
              <LicenseGrid container alignItems="center">
                <Grid item data-testid="last-update">
                  <Typography variant="body1">
                    {t('firmwareUpdate.lastUpdate', 'last update')}
                  </Typography>
                  <Typography variant="body2">
                    {t('firmwareUpdate.lastVersion', 'last version installed', {
                      firmwareVersion: firmwareVersion,
                      updateDate: updateDate,
                    })}
                  </Typography>
                </Grid>
              </LicenseGrid>
            )}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap="8px"
              onClick={() => handleHowToUpdateClick()}
              data-testid="how-to-update-button"
              sx={{
                color: darkTheme.colors.primary_11,
                cursor: 'pointer',
                '& svg': {
                  width: `${pathDimension(16)}px`,
                  height: `${pathDimension(16)}px`,
                  fill: darkTheme.colors.primary_11,
                },
              }}
            >
              <Typography variant="body2" textAlign="left">
                {t('firmwareUpdate.howToUpdate', 'how to update')}
              </Typography>
              <Icon name="Help" />
            </Box>
          </Stack>
        )}
        {showUpdateHowTo && (
          <Stack
            direction="column"
            alignItems="stretch"
            justifyContent="center"
            gap={1}
            marginBottom={5}
            data-testid="update-guidelines"
          >
            <Stack
              alignItems="center"
              sx={{
                color: 'inherit',
                textAlign: 'center',
                padding: '12px',
                svg: { path: { fill: darkTheme.colors.primary_11 } },
              }}
              className={style.headericon}
            >
              {isUpdateAvailable ? (
                <Icon name="UpdateAvailable" />
              ) : (
                <Icon name="License" />
              )}
              <Typography variant="body1" sx={{ ...darkTheme.typography.bold }}>
                {t('firmwareUpdate.header', 'license & software update')}
              </Typography>
            </Stack>
            <Box>
              <Box
                display="flex"
                alignItems="center"
                gap="8px"
                onClick={() => handleHowToUpdateClick()}
                data-testid="how-to-back-button"
                sx={{
                  color: darkTheme.colors.primary_11,
                  paddingBottom: '8px',
                  cursor: 'pointer',
                  '& svg': {
                    width: `${pathDimension(12)}px`,
                    height: `${pathDimension(12)}px`,
                    fill: darkTheme.colors.primary_11,
                  },
                }}
              >
                <Icon name="BackArrow" />
                <Typography variant="body1" textAlign="left">
                  {t('firmwareUpdate.howToUpdate', 'how to update')}
                </Typography>
              </Box>
              <Typography variant="body2">
                {t(
                  'firmwareUpdate.updateGuidelines',
                  'updates installation guidelines'
                )}
              </Typography>
            </Box>
            <Box component="ul" sx={{ paddingLeft: '24px' }}>
              <li>
                <Typography variant="body2">
                  {t('firmwareUpdate.logMyWorld', 'logs into myWorld')}
                </Typography>
              </li>

              <li>
                <Typography variant="body2">
                  {t('firmwareUpdate.savePEF', 'save PegasusFIELD')}
                </Typography>
              </li>

              <li>
                <Typography variant="body2">
                  {t('firmwareUpdate.plugDevice', 'plug your storage')}
                </Typography>
              </li>

              <li>
                <Typography variant="body2">
                  {t('firmwareUpdate.clickUpdateNow', 'click Update now')}
                </Typography>
              </li>
            </Box>
          </Stack>
        )}
      </Container>
    </Popover>
  )
}
