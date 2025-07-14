/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */
/* eslint-disable no-param-reassign */

import useInterval from 'hooks/useInterval'
import { head } from 'ramda'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectIsAdmin, selectIsLoggedIn } from 'store/features/auth/slice'
import api from 'store/features/system/api'
import { flushLogsAction, selectFlushLogs } from 'store/features/system/slice'
import { ClientLogItem } from 'store/features/system/types'
import { IS_TESTING } from 'utils/capabilities'

// https://unicode.org/emoji/charts/full-emoji-list.html?utm_source=thenewstack&utm_medium=website&utm_campaign=platform
const prefixDevInfo: string = String.fromCodePoint(0x26aa)
const prefixDevWarning: string = String.fromCodePoint(0x1f7e1)
const prefixDevError: string = String.fromCodePoint(0x1f534)
const prefixSystem: string = String.fromCodePoint(0x1fab2)
const UPDATE_INTERVAL = 2000
const FLUSH_TO_SERVER_INTERVAL =
  Number(process.env.NX_FLUSH_TO_SERVER_INTERVAL) || 10000
console.info(`[LOGS] FLUSH_TO_SERVER_INTERVAL: ${FLUSH_TO_SERVER_INTERVAL}`)

const nativeConsole = console
let logStore: LogItem[] = []

export const useAdminLogs = (): [LogItem[], () => void] => {
  const isAdmin = useSelector(selectIsAdmin)
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const [logs, setLogs] = useState<LogItem[]>(logStore)
  const shouldFlushLogs = useSelector(selectFlushLogs)
  const dispatch = useDispatch()

  const flushLogs = useCallback(() => {
    if (!isLoggedIn) {
      console.warn('[LOGS] not logged in, check again next time')
      return
    }
    const stringify = (s: string | any): string =>
      typeof s === 'string' ? s : JSON.stringify(s)

    const maxLength = (s: string | any): string => {
      const str = typeof s === 'string' ? s : JSON.stringify(s)
      try {
        return str.substring(0, 500)
      } catch (error) {
        return 'unreadable error'
      }
    }
    const writableLogs: ClientLogItem[] = logStore
      .map(({ type, time, args }) => {
        let prefixDev = prefixDevInfo
        if (type === 'error') prefixDev = prefixDevError
        if (type === 'warn') prefixDev = prefixDevWarning
        return {
          type,
          time: Math.round(time / 1000),
          message: `${head(args[0]) === '[' ? prefixDev : prefixSystem} ${args
            .map(maxLength)
            .map(stringify)
            .join(' - ')}`,
        }
      })
      .reverse()
    api
      .systeClientLog({ logs: writableLogs })
      .then(() => {
        logStore = []
        setLogs(logStore)
        console.info('[LOGS] saved to the server and flushed')
      })
      .catch(() => {
        console.warn(
          '[LOGS] could not save the logs, keep them in memory for now'
        )
      })
  }, [isLoggedIn])

  const logToStore = (type: LogItem['type'], ...args: string[]) => {
    try {
      switch (type) {
        case 'error':
          nativeConsole.error(prefixDevError, ...args)
          break
        case 'warn':
          nativeConsole.warn(prefixDevWarning, ...args)
          break
        case 'info':
          nativeConsole.info(prefixDevInfo, ...args)
          break
        default:
          break
      }
      // if (!isAdmin) return
      logStore = [
        { type, args: args.slice(0, 2), time: Date.now() },
        ...logStore,
      ]
    } catch (e) {
      console.error(prefixDevError, 'log error', e)
    }
  }

  const clearLogs = () => {
    logStore = []
  }

  /**
   * we can't rely on useState for this since it creates conflicts with redux
   * the log list will update at regular intervals, but not in real time
   */
  useInterval(
    () => {
      // if (!isAdmin) return
      setLogs(logStore)
    },
    UPDATE_INTERVAL,
    !isAdmin
  )

  /**
   * save the logs on the server and flush them at fixed intervals
   */
  useInterval(
    () => {
      console.info('[LOGS] time to flush')
      flushLogs()
    },
    FLUSH_TO_SERVER_INTERVAL,
    false
  )

  useEffect(() => {
    if (shouldFlushLogs) {
      console.info('[LOGS] manually flushing logs')
      flushLogs()
      dispatch(flushLogsAction(false))
    }
  }, [dispatch, flushLogs, shouldFlushLogs])

  useEffect(() => {
    window.onbeforeunload = () => {
      console.info('[LOGS] flushing logs before reload')
      flushLogs()
    }
    return () => {
      // window.onbeforeunload = null
    }
  }, [flushLogs])

  useEffect(() => {
    return () => {
      console.info('[LOGS] flushing logs at unmount')
      flushLogs()
    }
  }, [flushLogs])

  /**
   * if is admin, replace the native console
   * restore the native console if it's not
   */
  const wnd: any = window || null
  const glb = (wnd || global) as any
  // if (isAdmin) {
  if (!glb.console.custom) {
    glb.console = {
      custom: true,
      log(...args: string[]) {
        nativeConsole.log(...args)
      },
      warn(...args: string[]) {
        logToStore('warn', ...args)
      },
      info(...args: string[]) {
        logToStore('info', ...args)
      },
      error(...args: string[]) {
        logToStore('error', ...args)
      },
      table(...args: string[]) {
        nativeConsole.table(...args)
      },
    }
  } else {
    // console.error('trying to customize console more than once')
  }
  // } else {
  //   glb.console = nativeConsole
  // }

  return [logs, clearLogs]
}
