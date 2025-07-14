/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Drawer } from '@mui/material'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { AdminLogs } from 'components/molecules/AdminLogs/AdminLogs'
import style from 'components/molecules/AdminStatus/AdminStatus.module.scss'
import { useAdminLogs } from 'hooks/useAdminLogs'
import moment from 'moment'
import React, { FC, useCallback, useLayoutEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectIsAdmin } from 'store/features/auth/slice'
import { openDialogAction } from 'store/features/dialogs/slice'
import {
  selectClientReleaseTag,
  selectSystemInfo,
  selectSystemState,
} from 'store/features/system/slice'
import { formatSwVersion } from 'utils/strings'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stringify = (s: string | any): string =>
  typeof s === 'string' ? s : JSON.stringify(s)

/**
 * AdminStatus description
 */
export const AdminStatus: FC = () => {
  const isAdmin = useSelector(selectIsAdmin)
  const [logsOpen, setLogsOpen] = useState<boolean>(false)
  const systemState = useSelector(selectSystemState)
  const [logs, clearLogs] = useAdminLogs()
  const dispatch = useDispatch()
  const clientReleaseTag = useSelector(selectClientReleaseTag)
  const systemInfo = useSelector(selectSystemInfo)

  const serverReleaseTag = systemInfo?.softwareBuildType
  const windowsImage = systemInfo?.windowsBuild
  const backendVersion = systemInfo?.softwareversion
  const installerVersion = systemInfo?.installerversion

  const copyToClipboard = useCallback(
    (logsArr: LogItem[]) => {
      /* Copy the text inside the text field */
      try {
        navigator.clipboard.writeText(
          logsArr
            .reverse()
            .map((l) => {
              const time = moment(l.time).format('HH:mm:ss')
              return `${time} ${l.args.map(stringify).join(' - ')}`
            })
            .join('\n')
        )
        dispatch(
          openDialogAction({
            component: DialogNames.Alert,
            componentProps: {
              type: 'message',
              text: 'Log copied to clipboard',
              title: 'Logs',
            } as IAlertProps,
          })
        )
        setLogsOpen(false)
      } catch (error) {
        dispatch(
          openDialogAction({
            component: DialogNames.Alert,
            componentProps: {
              type: 'error',
              text: 'Copy to clipboard not supported by this browser',
              title: 'Logs',
            } as IAlertProps,
          })
        )
      }
    },
    [dispatch]
  )

  useLayoutEffect(() => {
    if (!clientReleaseTag) return
    const { protocol, hostname } = window.location
    console.info(`[HOSTNAME] ${protocol}//${hostname}`)
    console.info(
      `[VERSION] ${formatSwVersion(
        clientReleaseTag,
        serverReleaseTag,
        windowsImage,
        backendVersion,
        installerVersion
      )}`
    )
  }, [
    clientReleaseTag,
    serverReleaseTag,
    windowsImage,
    backendVersion,
    installerVersion,
  ])

  useLayoutEffect(() => {
    if (!systemInfo) return
    console.info(
      `[SU] ${systemInfo.product} (SN: ${
        systemInfo.sensorUnit?.serial || '--'
      })`
    )
  }, [systemInfo])

  if (!isAdmin) return null
  return (
    <>
      <div className={style.systemState} onClick={() => setLogsOpen(true)}>
        {systemState?.state}
      </div>
      <Drawer
        anchor="bottom"
        open={logsOpen}
        onClose={() => setLogsOpen(false)}
        style={{ zIndex: 1800 }}
      >
        <AdminLogs logs={logs} clearLogs={clearLogs} onCopy={copyToClipboard} />
      </Drawer>
    </>
  )
}
