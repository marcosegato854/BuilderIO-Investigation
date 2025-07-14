/* eslint-disable @typescript-eslint/no-explicit-any */
import { waitFor } from '@testing-library/react'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { t } from 'i18n/config'
import WS from 'jest-websocket-mock'
import { store } from 'store/configureStore'
import { resetStoreAction } from 'store/features/global/slice'
import {
  notificationsSubscribeAction,
  notificationsUnsubscribeAction,
} from 'store/features/system/slice'
import { SystemNotification } from 'store/features/system/types'
import { getSocketUrl } from 'store/services/socketClientBackend'

describe('Notifications Socket', () => {
  let ws: WS

  beforeEach(async () => {
    ws = new WS(`${getSocketUrl()}/notification?token=null`)
    store.dispatch(notificationsSubscribeAction())
    await ws.connected
    jest.useFakeTimers()
  })

  afterEach(() => {
    store.dispatch(notificationsUnsubscribeAction())
    store.dispatch(resetStoreAction())
    WS.clean()
    jest.useRealTimers()
  })

  test('should dispatch an open dialog action when receiving a battery status message', async () => {
    const batteryNotification: SystemNotification = {
      code: 'BTU-001',
      description: 'Battery level is low',
      time: 'time',
      type: 4,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(batteryNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(store.getState().dialogs.dialogs.length).toBe(1)
    expect(
      (store.getState().dialogs.dialogs[0]?.componentProps as IAlertProps).text
    ).toBe(t('backend_errors.code.BTU-001', 'wrong') as string)
  })
})
