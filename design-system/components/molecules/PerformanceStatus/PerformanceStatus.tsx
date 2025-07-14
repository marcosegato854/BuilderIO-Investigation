import { CircularProgress, Grid, Portal } from '@mui/material'
import classNames from 'classnames'
import { BlinkingDot } from 'components/atoms/BlinkingDot/BlinkingDot'
import { ConnectionStatus } from 'components/atoms/ConnectionStatus/ConnectionStatus'
import { DevChip } from 'components/atoms/DevChip/DevChip'
import { Gdpr } from 'components/atoms/Gdpr/Gdpr'
import { Icon } from 'components/atoms/Icon/Icon'
import { Pie } from 'components/atoms/Pie/Pie'
import UsersConnectedSvg from 'components/atoms/UsersConnectedSVG/UsersConnectedSvg'
import style from 'components/molecules/PerformanceStatus/PerformanceStatus.module.scss'
import { isNil } from 'ramda'
import React, {
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import {
  selectDataStorageCurrentJob,
  selectDataStorageDisks,
  selectDataStorageTempJob,
  selectProcessingInfo,
} from 'store/features/dataStorage/slice'
import { selectCurrentPolygon } from 'store/features/routing/slice'
import { SystemResponsiveness } from 'store/features/system/types'
import { slotOrDiskShort } from 'utils/disks'
import { storageUnitHandler } from 'utils/numbers'
import { settings } from 'utils/planning/polygonHelpers'
import { batteryHealth } from 'utils/svg'
import { minInH } from 'utils/time'

export interface IPerformanceStatusProps {
  system: SystemResponsiveness['system']
  connection: SystemResponsiveness['connection']
  battery: SystemResponsiveness['battery']
  storage: SystemResponsiveness['storage']
  usersConnected: number
}

/**
 * PerformanceStatus description
 */
export const PerformanceStatus: FC<IPerformanceStatusProps> = ({
  system,
  connection,
  battery,
  storage,
  usersConnected
}: PropsWithChildren<IPerformanceStatusProps>) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const tempJob = useSelector(selectDataStorageTempJob)
  const currentJob = useSelector(selectDataStorageCurrentJob)
  const currentPolygon = useSelector(selectCurrentPolygon)
  const globalBattery = useRef<HTMLDivElement>(null)
  const detailBatteries = useRef<HTMLDivElement[]>([])
  const disks = useSelector(selectDataStorageDisks)
  // const audioSettings = useSelector(selectAudioState)
  // Socket connection down removed due to PEF-1709
  // const isSocketConnectionDown = useIsSocketConnectionDown()
  const processingInfo = useSelector(selectProcessingInfo)

  const showGdpr = useMemo(() => {
    if (currentPolygon) {
      if (settings(currentPolygon)?.camera?.enable === 0) return false
      if (settings(currentPolygon)?.camera?.blur === false) return true
    }
    if (tempJob) {
      if (tempJob?.camera?.enable === 0) return false
      if (tempJob?.camera?.blur === false) return true
    }
    if (currentJob?.camera?.enable === 0) return false
    if (currentJob?.camera?.blur === false) return true
    return false
  }, [tempJob, currentJob, currentPolygon])

  const handleToggle = () => {
    setOpen(!open)
  }

  useEffect(() => {
    if (!battery) return
    if (globalBattery.current) {
      const rect = globalBattery.current.querySelector('rect')
      const bHealth = battery.acplug ? 0 : battery.health
      if (rect) batteryHealth(rect, bHealth)
    }
    if (open && battery.details?.batteries?.length) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      battery.details?.batteries.forEach((b, i) => {
        if (detailBatteries.current[i]) {
          const detRect = detailBatteries.current[i].querySelector('rect')
          if (detRect) batteryHealth(detRect, b.health)
        }
      })
    }
  }, [battery, open])

  const BatteryIcon = useMemo(() => {
    if (!battery) return <Icon name="Battery" className={style.batteryIcon} />
    if (!battery.charging)
      return <Icon name="Battery" className={style.batteryIcon} />
    if (battery.charging)
      return <Icon name="Charging" className={style.batteryIcon} />
    return <Icon name="Battery" />
  }, [battery])

  const isProcessing = useMemo(() => {
    return processingInfo && processingInfo.length > 0
  }, [processingInfo])

  // const AudioIcon = useMemo(() => {
  //   if (!audioSettings) return VolumeOff
  //   if (audioSettings.globalVolume > 0) {
  //     if (
  //       audioSettings.audibleMessages.COLLECTION ||
  //       audioSettings.audibleMessages.NAVIGATION ||
  //       audioSettings.audibleMessages.ERROR
  //     )
  //       return VolumeOn
  //   }
  //   return VolumeOff
  // }, [audioSettings])

  return (
    <>
      <div
        className={style.sysInfo}
        onClick={handleToggle}
        aria-hidden="true"
        data-testid="toggle-expand"
      >
        <div>
          <Icon
            name="Caret"
            className={classNames({
              [style.caret]: true,
              [style.caretOpen]: open,
            })}
          />
        </div>
        <DevChip />
        {showGdpr && (
          <div className={style.gdpr}>
            <Gdpr />
          </div>
        )}
        {/* <div>
          <AudioIcon className={style.tachometer} />
        </div> */}
        {isProcessing && (
          <div className={style.circularProgress}>
            <CircularProgress
              size={16}
              // className={style.processing}
              data-testid="processing-icon"
            />
          </div>
        )}
        {system && (
          <div>
            <span className={style.label}>{100 - system.health || '--'}%</span>
            <Icon name="Performance" className={style.tachometer} />
            {system.critical && (
              <Icon name="Warning" className={style.statusWarning} />
            )}
          </div>
        )}
        {usersConnected && (
          <div>
            <span className={style.label} data-testid="usersConnectedLabel">{usersConnected}</span>
            {/* <Icon name="UsersConnected" className={style.usersSVG } /> */}
            <UsersConnectedSvg className={style.usersSVG }/>
          </div>
        )}
        {connection && !isNil(connection.health) && (
          <div>
            <ConnectionStatus value={connection.health} />
            {connection.critical && (
              <Icon name="Warning" className={style.statusWarning} />
            )}
          </div>
        )}
        {battery && (
          <div className={style.battery} ref={globalBattery}>
            {battery.acplug || (
              <span className={style.label}>{minInH(battery.minutes)}</span>
            )}
            {battery.acplug && <Icon name="ACPlug" className={style.acplug} />}
            {BatteryIcon}
          </div>
        )}
        {storage && (
          <div className={style.disk}>
            <span className={style.label}>
              {storageUnitHandler(storage.available)}/
              {storageUnitHandler(storage.total)}
            </span>
            <span className={style.pie}>
              <Pie perc={100 - storage.health} />
            </span>
            {/* <span className={style.lastSpan}>HD</span> */}
          </div>
        )}
      </div>
      {open && (
        <Portal>
          <div className={style.sysDetails} data-testid="details">
            <Grid container spacing={0}>
              {system && system.details && (
                <Grid item classes={{ item: style.sysDetailsColumn }}>
                  {system.details.cpu && (
                    <div className={style.row}>
                      <span className={style.label}>
                        {t('performance.system.cpu', 'cpu')}
                      </span>
                      <span>{100 - system.details.cpu.health}%</span>
                      {system.details.cpu.critical && (
                        <Icon name="Warning" className={style.statusWarning} />
                      )}
                    </div>
                  )}
                  {system.details.gpu && (
                    <div className={style.row}>
                      <span className={style.label}>
                        {t('performance.system.gpu', 'gpu')}
                      </span>
                      <span>{100 - system.details.gpu.health}%</span>
                      {system.details.gpu.critical && (
                        <Icon name="Warning" className={style.statusWarning} />
                      )}
                    </div>
                  )}
                  {system.details.ram && (
                    <div className={style.row}>
                      <span className={style.label}>
                        {t('performance.system.ram', 'ram')}
                      </span>
                      <span>{100 - system.details.ram.health}%</span>
                      {system.details.ram.critical && (
                        <Icon name="Warning" className={style.statusWarning} />
                      )}
                    </div>
                  )}
                </Grid>
              )}
              {connection && Object.keys(connection).length !== 0 && (
                <Grid item classes={{ item: style.sysDetailsColumn }}>
                  {!isNil(connection.internet) && (
                    <div className={style.row}>
                      <span className={style.label}>
                        {t('performance.connection.internet', 'internet')}
                      </span>
                      <ConnectionStatus value={connection.internet.health} />
                      {connection.internet.critical && (
                        <Icon name="Warning" className={style.statusWarning} />
                      )}
                    </div>
                  )}
                  {!isNil(connection.gateway) && (
                    <div className={style.row}>
                      <span className={style.label}>
                        {t('performance.connection.gateway', 'gateway')}
                      </span>
                      <ConnectionStatus value={connection.gateway.health} />
                      {connection.gateway.critical && (
                        <Icon name="Warning" className={style.statusWarning} />
                      )}
                    </div>
                  )}
                  {!isNil(connection.client) && (
                    <div className={style.row}>
                      <span className={style.label}>
                        {t('performance.connection.client', 'client')}
                      </span>
                      <ConnectionStatus value={connection.client.health} />
                      {connection.client.critical && (
                        <Icon name="Warning" className={style.statusWarning} />
                      )}
                    </div>
                  )}
                </Grid>
              )}
              {battery?.details && (
                <Grid item classes={{ item: style.sysDetailsColumn }}>
                  {battery.details.batteries.map((item, index) => {
                    const { name, health, minutes, active } = item
                    return (
                      <div className={style.batteryRow} key={name}>
                        <div
                          className={style.batteryStatus}
                          ref={(ref) => {
                            if (ref) detailBatteries.current[index] = ref
                          }}
                        >
                          <span className={style.label}>{health}%</span>
                          {BatteryIcon}
                          {active && <BlinkingDot />}
                        </div>
                        <div className={style.batteryDuration}>
                          {minInH(minutes)}
                        </div>
                      </div>
                    )
                  })}
                </Grid>
              )}
              {storage?.details && (
                <Grid item classes={{ item: style.sysDetailsColumn }}>
                  {storage.details.disks.map((disk) => {
                    const { name, total, available, health } = disk
                    return (
                      <div className={style.row} key={name}>
                        <span className={style.label}>
                          {storageUnitHandler(available)}/
                          {storageUnitHandler(total)}
                        </span>
                        <span className={style.pie}>
                          <Pie perc={100 - health} />
                        </span>
                        <span className={style.lastSpan}>
                          {slotOrDiskShort(name, disks)}
                        </span>
                      </div>
                    )
                  })}
                </Grid>
              )}
            </Grid>
          </div>
        </Portal>
      )}
    </>
  )
}
