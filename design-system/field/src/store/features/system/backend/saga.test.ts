import { store } from 'store/configureStore'
import { systemCheckUpdateActions } from 'store/features/system/slice'
import api from 'store/features/system/api'
import { AxiosResponse } from 'axios'
import { CheckUpdateResponse } from 'store/features/system/types'
import { resetStoreAction } from 'store/features/global/slice'
import { setUpdateSettings } from 'store/features/settings/slice'

describe('Check update dialog - new update', () => {
  beforeEach(async () => {
    jest.spyOn(api, 'checkUpdate').mockReturnValue(
      Promise.resolve({
        status: 200,
        data: {
          version: '1.0.0',
          newUpdate: true,
          coveredByMaintenance: true,
          changelog: 'Changelog',
        },
        statusText: 'progress',
        headers: {},
        config: {},
      }) as Promise<AxiosResponse<CheckUpdateResponse>>
    )
    store.dispatch(systemCheckUpdateActions.request({ userRequest: false }))
  })

  afterEach(() => {
    store.dispatch(resetStoreAction())
  })
  test('It should show a dialog with the available update', async () => {
    expect(store.getState().dialogs.dialogs.length).toBe(1)
    expect(store.getState().dialogs.dialogs[0].component).toBe(
      'UpdateAvailableDialog'
    )
  })
})

describe('Check update dialog - NO new update', () => {
  beforeEach(async () => {
    jest.spyOn(api, 'checkUpdate').mockReturnValue(
      Promise.resolve({
        status: 200,
        data: {
          version: '1.0.0',
          newUpdate: false,
          coveredByMaintenance: true,
          changelog: 'Changelog',
        },
        statusText: 'progress',
        headers: {},
        config: {},
      }) as Promise<AxiosResponse<CheckUpdateResponse>>
    )
    store.dispatch(systemCheckUpdateActions.request({ userRequest: false }))
  })

  afterEach(() => {
    store.dispatch(resetStoreAction())
  })

  test('It should NOT show a dialog with the available update', async () => {
    expect(store.getState().dialogs.dialogs.length).toBe(0)
  })
})

describe('Check update dialog - new update - opted to NOT show for 7 days', () => {
  beforeEach(async () => {
    jest.spyOn(api, 'checkUpdate').mockReturnValue(
      Promise.resolve({
        status: 200,
        data: {
          version: '1.0.0',
          newUpdate: true,
          coveredByMaintenance: true,
          changelog: 'Changelog',
        },
        statusText: 'progress',
        headers: {},
        config: {},
      }) as Promise<AxiosResponse<CheckUpdateResponse>>
    )
    store.dispatch(
      setUpdateSettings({
        hideUpdate: true,
        checkDate: new Date().toISOString(),
      })
    )
    store.dispatch(systemCheckUpdateActions.request({ userRequest: false }))
  })

  afterEach(() => {
    store.dispatch(resetStoreAction())
  })

  test('It should NOT show a dialog with the available update', async () => {
    expect(store.getState().dialogs.dialogs.length).toBe(0)
  })
})

describe('Check update dialog - new update - opted to NOT show - 7 days are passed', () => {
  beforeEach(async () => {
    jest.spyOn(api, 'checkUpdate').mockReturnValue(
      Promise.resolve({
        status: 200,
        data: {
          version: '1.0.0',
          newUpdate: true,
          coveredByMaintenance: true,
          changelog: 'Changelog',
        },
        statusText: 'progress',
        headers: {},
        config: {},
      }) as Promise<AxiosResponse<CheckUpdateResponse>>
    )
    store.dispatch(
      setUpdateSettings({
        hideUpdate: true,
        checkDate: '2023-12-12T00:00:00.000Z',
      })
    )
    store.dispatch(systemCheckUpdateActions.request({ userRequest: false }))
  })

  afterEach(() => {
    store.dispatch(resetStoreAction())
  })

  test('It should show a dialog with the available update', async () => {
    expect(store.getState().dialogs.dialogs.length).toBe(1)
    expect(store.getState().dialogs.dialogs[0].component).toBe(
      'UpdateAvailableDialog'
    )
  })
})

describe('Check update dialog - new update - no hide options selected', () => {
  beforeEach(async () => {
    jest.spyOn(api, 'checkUpdate').mockReturnValue(
      Promise.resolve({
        status: 200,
        data: {
          version: '1.0.0',
          newUpdate: true,
          coveredByMaintenance: true,
          changelog: 'Changelog',
        },
        statusText: 'progress',
        headers: {},
        config: {},
      }) as Promise<AxiosResponse<CheckUpdateResponse>>
    )
    store.dispatch(
      setUpdateSettings({
        hideUpdate: false,
        checkDate: '2023-12-12T00:00:00.000Z',
      })
    )
    store.dispatch(systemCheckUpdateActions.request({ userRequest: false }))
  })

  afterEach(() => {
    store.dispatch(resetStoreAction())
  })

  test('It should show a dialog with the available update', async () => {
    expect(store.getState().dialogs.dialogs.length).toBe(1)
    expect(store.getState().dialogs.dialogs[0].component).toBe(
      'UpdateAvailableDialog'
    )
  })
})

describe('Check update dialog - new update - user request', () => {
  beforeEach(async () => {
    jest.spyOn(api, 'checkUpdate').mockReturnValue(
      Promise.resolve({
        status: 200,
        data: {
          version: '1.0.0',
          newUpdate: true,
          coveredByMaintenance: true,
          changelog: 'Changelog',
        },
        statusText: 'progress',
        headers: {},
        config: {},
      }) as Promise<AxiosResponse<CheckUpdateResponse>>
    )
    store.dispatch(systemCheckUpdateActions.request({ userRequest: true }))
  })

  afterEach(() => {
    store.dispatch(resetStoreAction())
  })

  test('It should NOT show a dialog with the available update', async () => {
    expect(store.getState().dialogs.dialogs.length).toBe(0)
  })
})
