/* eslint-disable @typescript-eslint/no-explicit-any */
import { queries, RenderResult, screen, waitFor } from '@testing-library/react'
import { RoutingToast } from 'components/molecules/RoutingToast/RoutingToast'
import { t } from 'i18n/config'
import WS from 'jest-websocket-mock'
import moxios from 'moxios'
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
} from 'store/features/routing/types'
import { modulesActions, systemStateActions } from 'store/features/system/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClientBackend from 'store/services/apiClientBackend'
import apiClientNode from 'store/services/apiClientNode'
import { getSocketUrl } from 'store/services/socketClientBackend'
import { mkAutocapturePolygons } from 'store/features/routing/mockApi'
import { renderWithProvider } from 'utils/test'

const mockedStore: any = configureMockStore()({
  ...mockStore,
  routingService: {
    ...mockStore.routingService,
    routingEnabled: true,
  },
  system: {
    systemState: {
      state: 'Activated',
    },
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
  let mockedRoutingPolygonsApi: jest.SpyInstance<any>

  beforeEach(async () => {
    store = getTestingStore()
    mockDispatchTestStore = jest.spyOn(store, 'dispatch')
    mockDispatchRealStore = jest.spyOn(realStore, 'dispatch')
    mockedRoutingPolygonsApi = mkAutocapturePolygons()
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
    component = renderWithProvider(<RoutingToast />)(store)
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
    mockedRoutingPolygonsApi.mockClear()
    jest.useRealTimers()
    WS.clean()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should display the right icon based on routing action', async () => {
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
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByTestId(`routing-icon-${action}-${direction}`)
    ).toBeTruthy()
    // failed
    await waitFor(
      () => {
        ws.send(
          JSON.stringify({
            ...mockRouting,
            data: {
              ...mockRouting.data,
              action: HeremapsActionType.TURN,
              direction: HeremapsDirection.RIGHT,
            },
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByTestId(
        `routing-icon-${HeremapsActionType.TURN}-${HeremapsDirection.RIGHT}`
      )
    ).toBeTruthy()
  })

  test('Should be visible only during routing', async () => {
    await waitFor(
      () => {
        ws.send(JSON.stringify(mockRouting))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.getByTestId('routing-toast')).toBeTruthy()
    // end alignment
    await waitFor(
      () => {
        store.dispatch(
          alignmentMessageAction({
            ...mockStore.alignmentService.alignmentState!,
            alignmentPhase: AlignmentPhase.FINAL,
          })
        )
      },
      { timeout: 1000 }
    )
    jest.advanceTimersByTime(1000)
    expect(screen.queryByTestId('routing-toast')).not.toBeInTheDocument()
  })

  /* REMOVED IN PEF-1529 */
  /* test('Should display the current track name', async () => {
    await waitFor(
      () => {
        ws.send(JSON.stringify(mockRouting))
        store.dispatch(
          routingCurrentPathActions.success({
            polygons: [mockStore.routingService.routingCurrentPolygon!],
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.getByTestId('routing-toast')).toBeTruthy()
    expect(
      component.getByText(mockStore.routingService.routingCurrentPolygon!.name!)
    ).toBeTruthy()
  }) */

  test('Should not display if navigation setting is false', async () => {
    await waitFor(
      () => {
        ws.send(JSON.stringify(mockRouting))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.getByTestId('routing-direction')).toBeTruthy()
    // update setting
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
            enabled: false,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.queryByTestId('routing-direction')).not.toBeInTheDocument()
  })
})

describe('RoutingToast (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<RoutingToast />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should display the title', () => {
    const title = component.getByTestId('routing-title')
    expect(title).toBeTruthy()
  })

  test('Should display the instruction', () => {
    expect(component.getByTestId('routing-instruction')).toBeTruthy()
    expect(component.getByText(mockRouting.data.instruction!)).toBeTruthy()
  })

  /* REMOVED IN PEF-1529 */
  /* test('Should display the street name', () => {
    expect(component.getByTestId('routing-street')).toBeTruthy()
    expect(component.getByText(mockRouting.data.instruction!)).toBeTruthy()
  }) */

  test('Should display the icon', () => {
    expect(component.getByTestId('routing-icon')).toBeTruthy()
  })

  /* REMOVED IN PEF-1529 */
  /* test('Should display the street color', () => {
    expect(component.getByTestId('routing-color')).toBeTruthy()
  }) */

  test('The title should be translated', () => {
    const { action, direction } = mockRouting.data!
    const actionTranslated = t(`acquisition.routing.actions.${action}`, 'Wrong')
    const directionTranslated = t(
      `acquisition.routing.directions.${direction}`,
      'Wrong'
    )
    expect(
      component.getByText(`${actionTranslated} ${directionTranslated}`)
    ).toBeTruthy()
  })
})
