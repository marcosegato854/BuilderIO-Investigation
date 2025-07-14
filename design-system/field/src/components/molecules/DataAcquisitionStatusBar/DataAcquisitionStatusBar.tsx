import {
  CircularProgress,
  ClickAwayListener,
  Fade,
  Grid,
  Tooltip,
  styled,
} from '@mui/material'
import classNames from 'classnames'
import { Icon } from 'components/atoms/Icon/Icon'
import { isNil, keys } from 'ramda'
import React, { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { selectIsAdmin } from 'store/features/auth/slice'
import { selectDataStorageCurrentJob } from 'store/features/dataStorage/slice'
import { selectPosition } from 'store/features/position/slice'
import { FriendlyState } from 'store/features/position/types'
import { getGdopStatus } from 'store/features/rtk/utils'
import { StatusItem } from '../StatusItem/StatusItem'
import style from './DataAcquisitionStatusBar.module.scss'
import { ThemeProvider } from '@mui/system'
import { darkTheme } from 'utils/themes/mui'

/* custom MUI Tooltip */
const StatusBarTooltip = styled(Tooltip)(({ theme }) => ({
  '& .MuiTooltip-arrow': {
    color: theme.colors.primary_10,
  },
  '& .MuiTooltip-tooltip': {
    backgroundColor: theme.colors.primary_10,
  },
}))

/**
 * DataAcquisitionStatusBar description
 */
export const DataAcquisitionStatusBar: FC = () => {
  const { t } = useTranslation()
  const [tooltipOpen, setTooltipOpen] = React.useState(false)
  const currentJob = useSelector(selectDataStorageCurrentJob)
  const isAdmin = useSelector(selectIsAdmin)
  const isRTK = !!currentJob?.ntrip?.enable
  const position = useSelector(selectPosition)
  const friendlyState = position?.status.friendlystate
  const [showSpan, setShowSpan] = useState<boolean>(false)

  const handleTooltipClose = () => {
    setTooltipOpen(false)
  }
  const handleTooltipOpen = () => {
    setTooltipOpen(!tooltipOpen)
  }
  const yesNo = (value?: boolean) =>
    (value
      ? t('rtk.connection_info.yes', 'ok')
      : t('rtk.connection_info.no', 'ko')) as string

  const satellitesAvailable = useMemo(() => {
    if (!position?.satellites) return undefined
    if (position.satellites.total < 0) return undefined
    if (position.satellites.total === 0)
      return {
        total: 0,
        summary: 0,
      }
    const summary = keys(position.satellites)
      .reduce((stack, key) => {
        if (key === 'total') return stack
        stack.push(`${position.satellites[key]} ${key}`)
        return stack
      }, [] as string[])
      .join(', ')
    const total = keys(position.satellites).reduce((sum, key) => {
      if (key === 'total') return sum
      return sum + position.satellites[key]
    }, 0)
    // return `${total} (${summary})`
    return { total, summary }
  }, [position])

  const statusTitle = useMemo(
    () =>
      isRTK
        ? t('acquisition.imu', 'status')
        : t('acquisition.gnssins', 'status'),
    [isRTK, t]
  )

  const statusDesc = useMemo(
    () =>
      t(
        `acquisition.status.friendly_state_${friendlyState}`,
        String(friendlyState).toLowerCase()
      ),
    [friendlyState, t]
  )
  const StatusIcon = useMemo(() => {
    switch (friendlyState) {
      case FriendlyState.COMPUTED:
        return <Icon name="Completed" key={`friendlyState${friendlyState}`} />
      case FriendlyState.COMPUTING:
        return (
          <CircularProgress size={25} key={`friendlyState${friendlyState}`} />
        )
      case FriendlyState.CONVERGENCE_FAULT:
        return <Icon name="Warning2" key={`friendlyState${friendlyState}`} />
      case FriendlyState.CONVERGENCE_FAIL:
        return (
          <Icon name="GnssIns4Vect" key={`friendlyState${friendlyState}`} />
        )
      default:
        return <Icon name="Help" />
    }
  }, [friendlyState])
  const friendlyDescription = useMemo(
    () => position?.status.friendlydescription || null,
    [position]
  )
  const ToolTipContent = useMemo(
    () => <div className={style.tooltipContents}>{friendlyDescription}</div>,
    [friendlyDescription]
  )
  const accuracy = useMemo(() => position?.accuracy?.class || 0, [position])
  const spanInfo = useMemo(() => isAdmin && showSpan, [showSpan, isAdmin])

  const rtkStatusAccuracy = useMemo(() => {
    const status = position?.rtk?.rtkstatus
    if (!status) return 2
    if (status === 'RTK fixed') return 0
    return 1
  }, [position])

  const ageOfCorrectionsAccuracy = useMemo(() => {
    const age = position?.rtk?.ageofcorrections
    if (!age) return 2
    if (age <= 3) return 0
    if (age <= 10) return 1
    return 2
  }, [position])

  /* TODO: DISABLED
  const rtkCorrectionReceivedAccuracy = useMemo(() => {
    const correctionReceived = position?.rtk?.rtkcorrectionreceived
    if (!correctionReceived) return 2
    if (correctionReceived) return 0
    return 2
  }, [position])
  */

  const internetConnectedAccuracy = useMemo(() => {
    const connected = position?.rtk?.internetconnected
    if (!connected) return 2
    if (connected) return 0
    return 2
  }, [position])

  const rtkConnectedAccuracy = useMemo(() => {
    const connected = position?.rtk?.rtkserviceconnected
    if (!connected) return 2
    if (connected) return 0
    return 2
  }, [position])

  const toggleSpan = () => setShowSpan(!showSpan)

  const gdopStatus = useMemo(() => {
    if (position?.gdop) {
      return getGdopStatus(position.gdop)
    }
    return null
  }, [position])

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={style.container}
      data-testid="status-detail"
      onClick={toggleSpan}
    >
      <Grid container spacing={0} className={style.grid}>
        <Grid item xs={isRTK ? 3 : 5}>
          <div
            className={classNames({
              [style.gnssins]: true,
              [style.rtk]: isRTK,
            })}
          >
            <div className={style.text}>{`${statusTitle}: ${statusDesc}`}</div>
            <div
              className={classNames({
                [style.svgIcon]:
                  position?.status.friendlystate !== FriendlyState.COMPUTING,
                [style.icon]: true,
                [style[`iconState${friendlyState}`]]: true,
              })}
            >
              {StatusIcon}
            </div>
            {!!friendlyDescription && (
              <ClickAwayListener onClickAway={handleTooltipClose}>
                <div className={style.help}>
                  <ThemeProvider theme={darkTheme}>
                    <StatusBarTooltip
                      onClose={handleTooltipClose}
                      open={tooltipOpen}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      title={ToolTipContent}
                      arrow
                      placement="top"
                      TransitionComponent={Fade}
                    >
                      <Icon name="Help" onClick={handleTooltipOpen} />
                    </StatusBarTooltip>
                  </ThemeProvider>
                </div>
              </ClickAwayListener>
            )}
          </div>
        </Grid>
        {isRTK ? (
          <>
            <Grid item xs={3} className={style.satellites}>
              {/* TODO: disabled 
              <StatusItem
                label={t(
                  'acquisition.status.rtkcorrectionreceived',
                  'rtkcorrectionreceived'
                )}
                value={yesNo(position?.rtk?.rtkcorrectionreceived)}
                accuracy={rtkCorrectionReceivedAccuracy}
              />
              <StatusItem
                label={t('acquisition.status.rtkaccuracy', 'accuracy')}
                value={accuracy}
                accuracy={accuracy}
                hidden
              /> 
              */}
              <StatusItem
                label={t('acquisition.status.satelliteavailable', 'satellite')}
                value={satellitesAvailable?.total}
                accuracy={-1}
              />
            </Grid>
            <Grid item xs={3}>
              <StatusItem
                label={t('acquisition.status.rtkstatus', 'rtkstatus')}
                value={position?.rtk?.rtkstatus || undefined}
                accuracy={rtkStatusAccuracy}
              />
              <StatusItem
                label={t(
                  'acquisition.status.internetconnected',
                  'internetconnected'
                )}
                value={yesNo(position?.rtk?.internetconnected)}
                accuracy={internetConnectedAccuracy}
              />
            </Grid>
            <Grid item xs={3}>
              <StatusItem
                label={t(
                  'acquisition.status.ageofcorrections',
                  'ageofcorrections'
                )}
                value={position?.rtk?.ageofcorrections || undefined}
                accuracy={ageOfCorrectionsAccuracy}
              />
              <StatusItem
                label={t(
                  'acquisition.status.rtkserviceconnected',
                  'rtkserviceconnected'
                )}
                value={yesNo(position?.rtk?.rtkserviceconnected)}
                accuracy={rtkConnectedAccuracy}
              />
            </Grid>
          </>
        ) : null}
        {isRTK ? null : (
          <>
            <Grid item xs={2}>
              <StatusItem
                label={t('acquisition.status.gdop', 'accuracy')}
                value={gdopStatus || '--'}
                accuracy={isNil(gdopStatus) ? 2 : -1}
              />
            </Grid>
            <Grid item xs={5}>
              <StatusItem
                label={t('acquisition.status.satelliteavailable', 'satellite')}
                value={
                  satellitesAvailable
                    ? `${satellitesAvailable?.total} (${satellitesAvailable?.summary})`
                    : '--'
                }
                accuracy={-1}
              />
            </Grid>
          </>
        )}
        {spanInfo ? (
          <>
            <Grid item xs={4} className={style.spanInfo}>
              <StatusItem
                label={t('acquisition.status.status_map', 'status.ins')}
                value={position?.status?.ins}
                accuracy={-1}
              />
            </Grid>
            {/* <Grid item xs={3} className={style.spanInfo}>
              <StatusItem
                label={t('acquisition.status.gps_type', 'solution type')}
                value={position?.position?.gps?.type}
                accuracy={-1}
              />
            </Grid> */}
            <Grid item xs={4} className={style.spanInfo}>
              {position?.rtkenabled && (
                <StatusItem
                  label={t('acquisition.status.rtkaccuracy', 'accuracy')}
                  value={accuracy}
                  accuracy={accuracy}
                />
              )}
            </Grid>
            <Grid item xs={4} className={style.spanInfo}>
              <StatusItem
                label="friendlyState"
                value={friendlyState}
                accuracy={accuracy}
              />
            </Grid>
          </>
        ) : null}
      </Grid>
    </div>
  )
}
