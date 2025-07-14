import classNames from 'classnames'
import { ProgressOverlay } from 'components/atoms/ProgressOverlay/ProgressOverlay'
import { keys } from 'ramda'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { selectDataStorageCurrentProject } from 'store/features/dataStorage/slice'
import {
  selectRtkCurrentServer,
  selectRtkTestActionProgress,
  selectRtkTestInfo,
} from 'store/features/rtk/slice'
import { RtkTestInfo } from 'store/features/rtk/types'
import { getGdopStatus } from 'store/features/rtk/utils'
import {
  digits,
  forceDecimals,
  mtToFt,
  unitLabel,
  unitValueFull,
} from 'utils/numbers'
import style from './RTKConnectionInfo.module.scss'

type ParsedInfo = RtkTestInfo & {
  satellitesinuse?: number
  actualposition?: string
  precision2d?: string
}
type ParsedInfoKey = keyof ParsedInfo

/**
 * RTKConnectionInfo description
 */
export const RTKConnectionInfo: FC = () => {
  const { t } = useTranslation()
  const progress = useSelector(selectRtkTestActionProgress)
  const isAuthenticating = progress !== 0 && progress < 100
  const testInfo = useSelector(selectRtkTestInfo)
  const currentServer = useSelector(selectRtkCurrentServer)
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const unit = currentProject?.coordinate?.unit

  const parsedInfo: ParsedInfo = useMemo(() => {
    if (!testInfo)
      return {
        agecorrection: '--',
        actualposition: '--',
        asml: '--',
        gdop: '--',
        hdop: '--',
        satellites: {},
        internetconnection: false,
        ntripconnection: false,
        position: {
          latitude: '--',
          longitude: '--',
        },
        precision2d: '--',
        precisionheight: '--',
        satellitesinuse: 0,
        state: '--',
        vdop: '--',
      }
    const roundedMt = (v?: string) => {
      if (!v) return '--'
      const numeric = digits(unitValueFull(mtToFt, Number(v), unit), 3)
      const final = forceDecimals(numeric, 3)
      return `${final}${unitLabel('M', unit)}`
    }
    const ntripconnection = Boolean(
      testInfo.ntripconnection ||
        (Number(testInfo.agecorrection) && Number(testInfo.agecorrection) <= 5)
    )
    return {
      ...testInfo,
      ntripconnection,
      satellitesinuse:
        testInfo.satellites &&
        keys(testInfo.satellites).reduce(
          (stack, key) => stack + testInfo.satellites[key],
          0
        ),
      actualposition: '',
      position: {
        latitude: digits(Number(testInfo.position?.latitude), 8).toString(),
        longitude: digits(Number(testInfo.position?.longitude), 8).toString(),
      },
      asml: roundedMt(testInfo.position?.height),
      gdop: getGdopStatus(testInfo.gdop),
      precision2d: roundedMt(testInfo.precision2d),
      precisionheight: roundedMt(testInfo.precisionheight),
      hdop: digits(Number(testInfo.hdop), 3).toString(),
      vdop: digits(Number(testInfo.vdop), 3).toString(),
      agecorrection: `${digits(Number(testInfo.agecorrection), 3).toString()}s`,
    }
  }, [testInfo, unit])

  const fields = useMemo(() => {
    if (!parsedInfo) return []
    return [
      'internetconnection',
      'ntripconnection',
      'state',
      'precision2d',
      'precisionheight',
      'satellitesinuse',
      'satellites',
      'hdop',
      'vdop',
      'gdop',
      'agecorrection',
      'actualposition',
      'position',
      'asml',
    ].filter((i) => typeof parsedInfo[i as ParsedInfoKey] !== 'undefined')
  }, [parsedInfo])

  return (
    <div className={style.rtkConnectionInfo} data-testid="rtk-connection-info">
      <div className={style.header}>
        <div className={style.serverInfo}>
          {!!testInfo || (
            <div className={style.title}>
              {t('rtk.connection_info.waiting_for_test')}
            </div>
          )}
          {!!testInfo && currentServer && (
            <div className={style.title}>
              Connected to{' '}
              <span className={style.name}>{currentServer?.name}</span>
            </div>
          )}
          {currentServer && (
            <div className={style.ipAddress}>
              {`IP: ${currentServer?.server}`}
            </div>
          )}
        </div>
      </div>
      {parsedInfo && (
        <div className={style.body} data-testid="test-info">
          {fields.map((key) => {
            const value = parsedInfo[key as ParsedInfoKey]!
            const type = typeof value
            if (type === 'object')
              return keys(value).map((valueKey) => (
                <div className={style.row} key={`${key}-${valueKey}`}>
                  <div className={style.subLabel}>
                    {t(
                      `rtk.connection_info.${key as string}.${
                        valueKey as string
                      }`,
                      valueKey
                    )}
                  </div>
                  <div className={style.value}>{value[valueKey]}</div>
                </div>
              ))
            const stringValue =
              {
                string: value,
                number: value,
                boolean: value
                  ? t('rtk.connection_info.yes')
                  : t('rtk.connection_info.no'),
                bigint: value,
                function: '--',
                symbol: '--',
                undefined: '--',
              }[type] || value
            return (
              <div className={style.row} key={key}>
                <div className={style.label}>
                  {t(`rtk.connection_info.${key}`, key)}
                </div>
                <div
                  data-testid={`test-info-${key}`}
                  className={classNames({
                    [style.value]: true,
                    [style.valueEmpty]: stringValue === '',
                  })}
                >
                  {stringValue}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <ProgressOverlay display={isAuthenticating} />
    </div>
  )
}
