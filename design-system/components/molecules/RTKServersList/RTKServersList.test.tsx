/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import { RTKServersList } from 'components/molecules/RTKServersList/RTKServersList'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { t } from 'i18n/config'
import { DeepPartial, mergeDeepLeft } from 'ramda'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import { closeAllDialogsAction } from 'store/features/dialogs/slice'
import { mkRtkServerDelete, mkRtkServers } from 'store/features/rtk/mockApi'
import {
  OptimizedRootState,
  rtkServiceServersActions,
  rtkServiceSetCurrentServer,
  selectRtkCurrentServer,
} from 'store/features/rtk/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'

describe('RTKServersList - with no currentServer', () => {
  const overrides: DeepPartial<OptimizedRootState> = {
    rtkService: {
      currentServer: null,
    },
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(
    mergeDeepLeft(overrides, mockStore)
  )
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<RTKServersList />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should diplay servers from store', () => {
    expect(component.getAllByTestId('server-item').length).toBe(2)
  })

  test('Should ask for confirmation when clicking on delete icon', () => {
    const icon = component.getAllByTestId('icon-delete')
    expect(icon[0]).toBeTruthy()
    fireEvent.click(icon[0])
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dialogs/OPEN_DIALOG',
        payload: expect.objectContaining({
          componentProps: expect.objectContaining({
            title: t('rtk.server.delete_dialog.title', 'wrong'),
          }),
        }),
      })
    )
  })
})

describe('RTKServersList - with currentServer', () => {
  const overrides: DeepPartial<OptimizedRootState> = {
    rtkService: {
      currentServer: mockStore.rtkService.servers![0],
    },
  }
  const mockedStore: any = configureMockStore()(
    mergeDeepLeft(overrides, mockStore)
  )
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<RTKServersList />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should diplay servers from store', () => {
    expect(component.getAllByTestId('server-item').length).toBe(2)
  })

  test('Should highlight currently selected server', () => {
    expect(component.getAllByTestId('server-item-connected').length).toBe(1)
  })
})

describe('RTKServersList - real store', () => {
  let component: RenderResult<typeof queries>
  const store = getTestingStore()
  let mockedDeleteServerApi: jest.SpyInstance<any>
  let mockedServersListApi: jest.SpyInstance<any>

  beforeEach(async () => {
    component = renderWithProvider(
      <div>
        <DialogManager />
        <RTKServersList />
      </div>
    )(store)
    mockedDeleteServerApi = mkRtkServerDelete()
    mockedServersListApi = mkRtkServers()
    jest.useFakeTimers()
    await waitFor(
      () => {
        store.dispatch(
          rtkServiceServersActions.success({
            servers: mockStore.rtkService.servers!,
          })
        )
        store.dispatch(
          rtkServiceSetCurrentServer(mockStore.rtkService.servers![0]!)
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(async () => {
    await waitFor(
      () => {
        store.dispatch(closeAllDialogsAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    mockedDeleteServerApi.mockClear()
    mockedServersListApi.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should dispatch server deletion when confirming', async () => {
    const icon = component.getAllByTestId('icon-delete')
    expect(icon[0]).toBeTruthy()
    await waitFor(
      () => {
        fireEvent.click(icon[0])
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.getByText(t('rtk.server.delete_dialog.title', 'wrong') as string)
    ).toBeTruthy()
    const confirmButton = screen.getByText(
      t('rtk.server.delete_dialog.confirm', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(confirmButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockedDeleteServerApi).toHaveBeenCalled()
  })

  test('Should NOT dispatch server deletion when canceling', async () => {
    const icon = component.getAllByTestId('icon-delete')
    expect(icon[0]).toBeTruthy()
    await waitFor(
      () => {
        fireEvent.click(icon[0])
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.getByText(t('rtk.server.delete_dialog.title', 'wrong') as string)
    ).toBeTruthy()
    const confirmButton = screen.getByTestId('alert-cancel-button')
    await waitFor(
      () => {
        fireEvent.click(confirmButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockedDeleteServerApi).not.toHaveBeenCalled()
  })

  test('Should dispatch current server null when deleting current server', async () => {
    const stateBefore = await store.getState()
    const currentServerBefore = await selectRtkCurrentServer(stateBefore)
    expect(currentServerBefore).toBeTruthy()
    const icon = component.getAllByTestId('icon-delete')
    expect(icon[0]).toBeTruthy()
    await waitFor(
      () => {
        fireEvent.click(icon[0])
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.getByText(t('rtk.server.delete_dialog.title', 'wrong') as string)
    ).toBeTruthy()
    const confirmButton = screen.getByText(
      t('rtk.server.delete_dialog.confirm', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(confirmButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const stateAfter = await store.getState()
    const currentServerAfter = await selectRtkCurrentServer(stateAfter)
    expect(currentServerAfter).toBeFalsy()
  })
})
