/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import { RoutingToast } from 'components/molecules/RoutingToast/RoutingToast'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { t } from 'i18n/config'
import WS from 'jest-websocket-mock'
import moxios from 'moxios'
import { mergeDeepRight } from 'ramda'
import React from 'react'
import { Store } from 'redux'
import configureMockStore from 'redux-mock-store'
import { store as realStore } from 'store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import { actionsServiceActivationInfoActions } from 'store/features/actions/slice'
import { alignmentMessageAction } from 'store/features/alignment/slice'
import { AlignmentPhase } from 'store/features/alignment/types'
import {
  dataStorageJobDetailActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { resetStoreAction } from 'store/features/global/slice'
import {
  autocaptureStatusActions,
  routingStatusActions,
  routingSubscribeAction,
  routingUnsubscribeAction,
} from 'store/features/routing/slice'
import {
  HeremapsActionType,
  HeremapsDirection,
  AutocaptureNotificationType,
  RoutingSocketNotification,
} from 'store/features/routing/types'
import { modulesActions, systemStateActions } from 'store/features/system/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClientBackend from 'store/services/apiClientBackend'
import apiClientNode from 'store/services/apiClientNode'
import { getSocketUrl } from 'store/services/socketClientBackend'
import { mkAutocapturePolygons } from 'store/features/routing/mockApi'
import { translateAutocaptureNotification } from 'utils/notifications'
import { renderWithProvider } from 'utils/test'

const mockedStore = configureMockStore()({
  ...mockStore,
  routingService: {
    ...mockStore.routingService,
    routingEnabled: true,
  },
  alignmentService: {
    ...mockStore.alignmentService,
    alignmentState: {
      ...mockStore.alignmentService.alignmentState,
      alignmentPhase: AlignmentPhase.INITIAL_DONE,
    },
  },
})
const mockRouting = {
  type: 'direction',
  data: mockStore.routingService.routingState!,
}
const originalNotification: RoutingSocketNotification = {
  type: 'notification',
  data: {
    id: 1,
    time: '2021-11-24T09:36:01',
    type: 0,
    code: 'STT-002',
    description: 'Automatic stop recording in {p1} seconds',
    p1: '5',
  },
}

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('RoutingToast (Store)', () => {
  let ws: WS
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  let store: Store
  let mockDispatchTestStore: jest.SpyInstance<any, [action: any]>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>
  let mockedRoutingTracks: jest.SpyInstance<any>

  beforeEach(async () => {
    store = getTestingStore()
    mockDispatchTestStore = jest.spyOn(store, 'dispatch')
    mockDispatchRealStore = jest.spyOn(realStore, 'dispatch')
    mockedRoutingTracks = mkAutocapturePolygons()
    // mock API
    moxios.install(apiClientNode)
    moxios.stubRequest(
      `/addFolder/${mockStore.dataStorageService.currentProject?.name}/${mockStore.dataStorageService.currentJob?.name}`,
      {
        status: 200,
        response: {},
      }
    )
    moxios.install(apiClientBackend)
    moxios.stubRequest('/position/ntrip', {
      status: 200,
      response: {},
    })
    // mock socket
    ws = new WS(`${getSocketUrl()}/routing`)
    // ws = new WS(`${getMockSocketUrl()}`)
    store.dispatch(routingSubscribeAction())
    // wait for ws connection
    await ws.connected
    // render
    component = renderWithProvider(
      <div>
        <DialogManager />
        <RoutingToast />
      </div>
    )(store)
    // enable fake timers
    jest.useFakeTimers()
    // fill the store
    await waitFor(
      () => {
        // fill current project
        store.dispatch(
          dataStorageProjectDetailActions.success(
            mockStore.dataStorageService.currentProject!
          )
        )
        // fill current job
        store.dispatch(
          dataStorageJobDetailActions.success({
            job: mockStore.dataStorageService.currentJob!,
          })
        )
        // set activation status
        store.dispatch(
          systemStateActions.success({
            state: 'Activated',
          })
        )
        store.dispatch(
          actionsServiceActivationInfoActions.success({
            action: {
              status: 'done',
              progress: 100,
              description: '',
            },
          })
        )
        // set routing enabled
        store.dispatch(
          modulesActions.success({ modules: mockStore.system.modules })
        )
        store.dispatch(
          routingStatusActions.success({
            enabled: true,
            initial: false,
            final: false,
          })
        )
        store.dispatch(
          autocaptureStatusActions.success({
            enabled: true,
          })
        )
      },
      { timeout: 300 }
    )
    jest.advanceTimersByTime(300)
    await waitFor(
      () => {
        // set alignment status
        store.dispatch(
          alignmentMessageAction({
            ...mockStore.alignmentService.alignmentState!,
            alignmentPhase: AlignmentPhase.INITIAL_DONE,
          })
        )
      },
      { timeout: 200 }
    )
    jest.advanceTimersByTime(200)
  })

  afterEach(async () => {
    await waitFor(
      () => {
        store.dispatch(routingUnsubscribeAction())
        store.dispatch(resetStoreAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    moxios.uninstall(apiClientNode)
    moxios.uninstall(apiClientBackend)
    mockDispatchTestStore.mockClear()
    mockDispatchRealStore.mockClear()
    mockedRoutingTracks.mockClear()
    // mockedRoutingApi.mockClear()
    jest.useRealTimers()
    WS.clean()
  })

  test('should display with a stop recording notification', async () => {
    await waitFor(
      () => {
        ws.send(JSON.stringify(originalNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.queryByTestId('routing-direction')).not.toBeInTheDocument()
    expect(component.getByTestId('autocapture-notification')).toBeTruthy()
  })

  test('should display the stop autocapture dialog if the notification button is clicked', async () => {
    await waitFor(
      () => {
        ws.send(JSON.stringify(originalNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const button = screen.getByTestId('autocapture-notification-button')
    await waitFor(
      () => {
        fireEvent.click(button)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.queryByText(
        t('acquisition.routing.dialogs.abort.text', 'wrong') as string
      )
    ).toBeTruthy()
  })

  test('should display also if routing is disabled, if autocapture is enabled', async () => {
    await waitFor(
      () => {
        ws.send(JSON.stringify(originalNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(component.getByTestId('autocapture-notification')).toBeTruthy()
    await waitFor(
      () => {
        store.dispatch(
          routingStatusActions.success({
            enabled: false,
            initial: false,
            final: false,
          })
        )
        store.dispatch(
          autocaptureStatusActions.success({
            enabled: true,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(component.getByTestId('autocapture-notification')).toBeTruthy()
  })

  test('should not display if notification is removed', async () => {
    await waitFor(
      () => {
        ws.send(JSON.stringify(originalNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(component.getByTestId('autocapture-notification')).toBeTruthy()
    await waitFor(
      () => {
        const removeNotification = mergeDeepRight(originalNotification, {
          data: { type: AutocaptureNotificationType.REMOVE },
        })
        ws.send(JSON.stringify(removeNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.queryByTestId('autocapture-notification')
    ).not.toBeInTheDocument()
  })

  test('should not display without a stop recording notification', async () => {
    await waitFor(
      () => {
        ws.send(
          JSON.stringify({
            type: 'direction',
            data: {
              ...mockRouting,
              action: HeremapsActionType.TURN,
              direction: HeremapsDirection.LEFT,
            },
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.queryByTestId('autocapture-notification')
    ).not.toBeInTheDocument()
  })

  test('should display together with the routing toaster', async () => {
    const { action, direction } = mockRouting.data
    await waitFor(
      () => {
        ws.send(
          JSON.stringify({
            type: 'direction',
            data: {
              ...mockRouting,
              action: HeremapsActionType.TURN,
              direction: HeremapsDirection.LEFT,
            },
          })
        )
        ws.send(JSON.stringify(originalNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByTestId(`routing-icon-${action}-${direction}`)
    ).toBeTruthy()
    expect(component.getByTestId('autocapture-notification')).toBeTruthy()
  })

  test('should update with a new stop recording notification', async () => {
    await waitFor(
      () => {
        ws.send(JSON.stringify(originalNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByText(
        translateAutocaptureNotification(originalNotification.data).description
      )
    ).toBeTruthy()
    await waitFor(
      () => {
        ws.send(JSON.stringify(originalNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByText(
        translateAutocaptureNotification(originalNotification.data).description
      )
    ).toBeTruthy()
    const updatedNotification: RoutingSocketNotification = mergeDeepRight(
      originalNotification,
      {
        data: { p1: '4' },
      }
    )
    await waitFor(
      () => {
        ws.send(JSON.stringify(updatedNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.queryByText(
        translateAutocaptureNotification(originalNotification.data).description
      )
    ).not.toBeInTheDocument()
    jest.advanceTimersByTime(500)
    expect(
      component.getByText(
        translateAutocaptureNotification(updatedNotification.data).description
      )
    ).toBeTruthy()
  })
})
