/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { AlignmentToast } from 'components/molecules/AlignmentToast/AlignmentToast'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { t } from 'i18n/config'
import WS from 'jest-websocket-mock'
import moxios from 'moxios'
import { mergeDeepRight } from 'ramda'
import { Store } from 'redux'
import configureMockStore from 'redux-mock-store'
import { store as realStore } from 'store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import {
  actionsServiceActivationInfoActions,
  actionsServiceDeactivateSystemAction,
} from 'store/features/actions/slice'
import {
  mkAlignmentCommand,
  mkAlignmentStatus,
} from 'store/features/alignment/mockApi'
import {
  alignmentCommandActions,
  alignmentSubscribeAction,
  alignmentUnsubscribeAction,
} from 'store/features/alignment/slice'
import {
  AlignmentCommand,
  AlignmentDialog,
  AlignmentNotification,
  AlignmentPhase,
} from 'store/features/alignment/types'
import {
  dataStorageJobDetailActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { resetStoreAction } from 'store/features/global/slice'
import { systemStateActions } from 'store/features/system/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClientBackend from 'store/services/apiClientBackend'
import apiClientNode from 'store/services/apiClientNode'
import { getSocketUrl } from 'store/services/socketClientBackend'

import { mkAutocapturePolygons } from 'store/features/routing/mockApi'
import { mtToFt } from 'utils/numbers'
import { renderWithProvider } from 'utils/test'
import { getType } from 'typesafe-actions'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mergedStore = mergeDeepRight(mockStore, {
  system: {
    systemState: {
      state: 'InitialAlignment',
    },
  },
})
const mockedStore: any = configureMockStore()(mergedStore)
const mergedStoreCancel = mergeDeepRight(mockStore, {
  system: {
    systemState: {
      state: 'InitialAlignment',
    },
  },
  alignmentService: {
    alignmentState: {
      isFailure: true,
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
    },
  },
})
const mockedStoreCancel: any = configureMockStore()(mergedStoreCancel)
const mergedStoreProceed = mergeDeepRight(mockStore, {
  system: {
    systemState: {
      state: 'InitialAlignment',
    },
  },
  alignmentService: {
    alignmentState: {
      isFailure: false,
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
    },
  },
})
const mockedStoreProceed: any = configureMockStore()(mergedStoreProceed)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch
const mockDispatchCancel = jest.fn()
mockedStoreCancel.dispatch = mockDispatchCancel
const mockDispatchProceed = jest.fn()
mockedStoreProceed.dispatch = mockDispatchProceed

describe('AlignmentToast (Store)', () => {
  let ws: WS
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  let store: Store
  let mockDispatchTestStore: jest.SpyInstance<any, [action: any]>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>
  let mockedAlignmentCommandApi: jest.SpyInstance<any>
  let mockedAlignmentStateApi: jest.SpyInstance<any>
  let mockedPolygonsApi: jest.SpyInstance<any>

  beforeEach(async () => {
    store = getTestingStore()
    mockDispatchTestStore = jest.spyOn(store, 'dispatch')
    mockDispatchRealStore = jest.spyOn(realStore, 'dispatch')
    mockedAlignmentCommandApi = mkAlignmentCommand()
    mockedPolygonsApi = mkAutocapturePolygons()
    mockedAlignmentStateApi = mkAlignmentStatus()
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
    moxios.stubRequest('/routing/autocapture/polygons', {
      status: 200,
      response: {},
    })
    // mock socket
    ws = new WS(`${getSocketUrl()}/position/alignment`)
    store.dispatch(alignmentSubscribeAction())
    // wait for ws connection
    await ws.connected
    // render
    component = renderWithProvider(
      <div>
        <DialogManager />
        <AlignmentToast />
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
        // set system state
        store.dispatch(
          systemStateActions.success({
            state: 'InitialAlignment',
          })
        )
        // set activation status
        store.dispatch(
          actionsServiceActivationInfoActions.success({
            action: {
              status: 'done',
              progress: 100,
              description: '',
            },
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(async () => {
    await waitFor(
      () => {
        store.dispatch(alignmentUnsubscribeAction())
        store.dispatch(resetStoreAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    moxios.uninstall(apiClientNode)
    moxios.uninstall(apiClientBackend)
    mockDispatchTestStore.mockClear()
    mockDispatchRealStore.mockClear()
    mockedAlignmentCommandApi.mockClear()
    mockedAlignmentStateApi.mockClear()
    mockedPolygonsApi.mockClear()
    jest.useRealTimers()
    WS.clean()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should change the title based on the dialog type', async () => {
    // static
    const notificationStatic: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.STATIC,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationStatic))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByText(
        t('acquisition.alignment.title.static', 'Wrong') as string
      )
    ).toBeTruthy()
    // dynamic
    const notificationDynamic: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationDynamic))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByText(
        t('acquisition.alignment.title.confirmation', 'Wrong') as string
      )
    ).toBeTruthy()
  })

  test('Should translate the dialog message', async () => {
    const notification: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      description: 'untranslated description',
      messageCode: 'AF',
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByText(
        t(
          `acquisition.alignment.messages.${notification.messageCode}`,
          'Wrong'
        ) as string
      )
    ).toBeTruthy()
  })

  test('Should fallback the dialog message if translation is unavailable', async () => {
    const notification: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      description: 'untranslated description',
      messageCode: 'UNAVAILABLE-CODE',
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(component.getByText(notification.description)).toBeTruthy()
  })

  test('Should replace the time parameter in the message', async () => {
    const notification: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      description: '{time} static alignment',
      messageCode: 'UNAVAILABLE-CODE',
      time: 90,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByText(`${notification.time} seconds static alignment`)
    ).toBeTruthy()
  })

  test('Should replace the space parameter in the message', async () => {
    const notification: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      description: '{space} dynamic alignment',
      messageCode: 'UNAVAILABLE-CODE',
      space: 90,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByText(`${notification.space} meters dynamic alignment`)
    ).toBeTruthy()
  })

  test('Should use the right unit in the space parameter', async () => {
    await waitFor(
      () => {
        // fill current project
        const imperialProject = mergeDeepRight(
          mockStore.dataStorageService.currentProject!,
          {
            coordinate: {
              unit: 'imperial',
            },
          }
        )
        store.dispatch(
          dataStorageProjectDetailActions.success(imperialProject as IProject)
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const notification: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      description: '{space} dynamic alignment',
      messageCode: 'UNAVAILABLE-CODE',
      space: 90,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const expectedValue = Math.ceil(mtToFt(Number(notification.space)))
    expect(
      component.getByText(`${expectedValue} feet dynamic alignment`)
    ).toBeTruthy()
  })

  test('Should display the countdown units based on the project units', async () => {
    await waitFor(
      () => {
        // fill current project
        const imperialProject = mergeDeepRight(
          mockStore.dataStorageService.currentProject!,
          {
            coordinate: {
              unit: 'imperial',
            },
          }
        )
        store.dispatch(
          dataStorageProjectDetailActions.success(imperialProject as IProject)
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const notification: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.METERS_BASED_DYNAMIC,
      description: '{space} dynamic alignment',
      messageCode: 'UNAVAILABLE-CODE',
      space: 500,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const countDownDiv = component.getByTestId('alignment-countdown')
    expect(
      within(countDownDiv).getByText(
        t('acquisition.alignment.remaining_feet', 'wrong') as string
      )
    ).toBeTruthy()
    expect(
      within(countDownDiv).getByText(
        Math.ceil(mtToFt(Number(notification.remaining)))
      )
    ).toBeTruthy()
  })

  test('Should display the countdown if dynamic', async () => {
    const notificationDynamic: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationDynamic))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(component.getByTestId('alignment-countdown')).toBeTruthy()
    // Should display the countdown if dynamic
    expect(component.getByText(notificationDynamic.remaining!)).toBeTruthy()
  })

  test('Should display the countdown units based on the dialog type', async () => {
    const notificationDynamic: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.TIME_BASED_DYMANIC,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationDynamic))
      },
      { timeout: 1000 }
    )
    jest.advanceTimersByTime(1000)
    expect(component.getByTestId('alignment-countdown')).toBeTruthy()
    // Should display the countdown if dynamic
    expect(
      component.getByText(
        t('acquisition.alignment.remaining_seconds', 'wrong') as string
      )
    ).toBeTruthy()
    // meters
    await waitFor(
      () => {
        ws.send(
          JSON.stringify({
            ...notificationDynamic,
            dialog: AlignmentDialog.METERS_BASED_DYNAMIC,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // Should display the countdown if dynamic
    expect(
      component.getByText(
        t('acquisition.alignment.remaining_meters', 'wrong') as string
      )
    ).toBeTruthy()
  })

  test('Should display the right icon on confirm dialogs', async () => {
    const notificationComplete: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.STATIC_CONFIRMATION,
      isFailure: false,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationComplete))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(component.getByTestId('alignment-complete-icon')).toBeTruthy()
    // failed
    await waitFor(
      () => {
        ws.send(
          JSON.stringify({
            ...notificationComplete,
            isFailure: true,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(component.getByTestId('alignment-failed-icon')).toBeTruthy()
  })

  test('Should not display the buttons if not confirmation', async () => {
    const notificationConfirmation: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.METERS_BASED_DYNAMIC,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationConfirmation))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.queryByTestId('alignment-buttons')).not.toBeInTheDocument()
  })

  test('Should display the buttons if confirmation', async () => {
    const notificationConfirmation: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationConfirmation))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(component.getByTestId('alignment-buttons')).toBeTruthy()
  })

  test('Should call an api on proceed confirmation', async () => {
    const notificationConfirmation: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationConfirmation))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const proceedButton = component.getByTestId('alignment-buttons-proceed')
    await waitFor(
      () => {
        fireEvent.click(proceedButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockedAlignmentCommandApi).toHaveBeenCalledWith({
      action: AlignmentCommand.PROCEED,
    })
  })

  test('Should call an api on deactivate click', async () => {
    const notificationConfirmation: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
      alignmentPhase: AlignmentPhase.FINAL_DONE,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationConfirmation))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const proceedButton = component.getByTestId('alignment-buttons-proceed')
    await waitFor(
      () => {
        fireEvent.click(proceedButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatchTestStore).toHaveBeenCalledWith(
      actionsServiceDeactivateSystemAction()
    )
  })

  test('Should call an api on failure confirmation', async () => {
    const notificationConfirmation: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
      isFailure: true,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationConfirmation))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const proceedButton = component.getByTestId('alignment-buttons-proceed')
    await waitFor(
      () => {
        fireEvent.click(proceedButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    expect(
      screen.getByText(
        t('acquisition.alignment.skip_alert.text', 'Wrong') as string
      )
    ).toBeTruthy()
  })

  test('Should change the button labels on failure', async () => {
    const notificationConfirmation: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
      isFailure: true,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationConfirmation))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByText(t('acquisition.alignment.skip', 'Wrong') as string)
    )
  })

  test('Should display deactivate label if in final done phase', async () => {
    const notificationConfirmation: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.STATIC_CONFIRMATION,
      alignmentPhase: AlignmentPhase.FINAL_DONE,
      isFailure: true,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationConfirmation))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByText(
        t('acquisition.alignment.deactivate', 'Wrong') as string
      )
    )
  })

  test('Should hide the retry button if not failure', async () => {
    const notificationConfirmation: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationConfirmation))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.queryByTestId('alignment-buttons-cancel')
    ).not.toBeInTheDocument()
  })

  test('Should call an api on retry confirmation', async () => {
    const notificationConfirmation: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
      isFailure: true,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationConfirmation))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const proceedButton = component.getByTestId('alignment-buttons-cancel')
    await waitFor(
      () => {
        fireEvent.click(proceedButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockedAlignmentCommandApi).toHaveBeenCalledWith({
      action: AlignmentCommand.RETRY,
    })
  })

  test('Should be visible only during alignment', async () => {
    const notificationConfirmation: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
    }
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({
            state: 'InitialAlignment',
          })
        )
        ws.send(JSON.stringify(notificationConfirmation))
      },
      { timeout: 1000 }
    )
    jest.advanceTimersByTime(1000)
    expect(screen.getByTestId('alignment-toast')).toBeTruthy()
    // end alignment
    await waitFor(
      () => {
        ws.send(
          JSON.stringify({
            ...notificationConfirmation,
            alignmentPhase: AlignmentPhase.INITIAL_DONE,
          })
        )
        store.dispatch(
          systemStateActions.success({
            state: 'Logging',
          })
        )
      },
      { timeout: 1000 }
    )
    jest.advanceTimersByTime(1000)
    expect(screen.queryByTestId('alignment-toast')).not.toBeInTheDocument()
  })

  test('Should be visible if final alignment is done', async () => {
    const notificationConfirmation: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationConfirmation))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.getByTestId('alignment-toast')).toBeTruthy()
    // end alignment
    await waitFor(
      () => {
        ws.send(
          JSON.stringify({
            ...notificationConfirmation,
            alignmentPhase: AlignmentPhase.FINAL_DONE,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.getByTestId('alignment-toast')).toBeTruthy()
  })

  test('Should NOT be visible if the system is deactivating', async () => {
    const notificationConfirmation: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationConfirmation))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.getByTestId('alignment-toast')).toBeTruthy()
    // end alignment
    await waitFor(
      () => {
        ws.send(
          JSON.stringify({
            ...notificationConfirmation,
            alignmentPhase: AlignmentPhase.FINAL_DONE,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.getByTestId('alignment-toast')).toBeTruthy()
  })

  test('Should NOT be visible if the system is deactivating', async () => {
    const notificationConfirmation: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationConfirmation))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.getByTestId('alignment-toast')).toBeTruthy()
    // end alignment
    await waitFor(
      () => {
        ws.send(
          JSON.stringify({
            ...notificationConfirmation,
            alignmentPhase: AlignmentPhase.FINAL_DONE,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // deactivating
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({
            state: 'Deactivating',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.queryByTestId('alignment-toast')).not.toBeInTheDocument()
  })
})

describe('AlignmentToast (Store) final alignment', () => {
  let ws: WS
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  let store: Store
  let mockDispatchTestStore: jest.SpyInstance<any, [action: any]>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>
  let mockedAlignmentCommandApi: jest.SpyInstance<any>
  let mockedAlignmentStateApi: jest.SpyInstance<any>
  let mockedPolygonsApi: jest.SpyInstance<any>

  beforeEach(async () => {
    store = getTestingStore()
    mockDispatchTestStore = jest.spyOn(store, 'dispatch')
    mockDispatchRealStore = jest.spyOn(realStore, 'dispatch')
    mockedAlignmentCommandApi = mkAlignmentCommand()
    mockedPolygonsApi = mkAutocapturePolygons()
    mockedAlignmentStateApi = mkAlignmentStatus(
      mergeDeepRight(mockStore.alignmentService.alignmentState, {
        alignmentPhase: AlignmentPhase.FINAL,
      }) as AlignmentNotification
    )
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
    moxios.stubRequest('/routing/autocapture/polygons', {
      status: 200,
      response: {},
    })
    // mock socket
    ws = new WS(`${getSocketUrl()}/position/alignment`)
    store.dispatch(alignmentSubscribeAction())
    // wait for ws connection
    await ws.connected
    // render
    component = renderWithProvider(
      <div>
        <DialogManager />
        <AlignmentToast />
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
        // set system state
        store.dispatch(
          systemStateActions.success({
            state: AlignmentPhase.FINAL,
          })
        )
        // set activation status
        store.dispatch(
          actionsServiceActivationInfoActions.success({
            action: {
              status: 'done',
              progress: 100,
              description: '',
            },
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(async () => {
    await waitFor(
      () => {
        store.dispatch(alignmentUnsubscribeAction())
        store.dispatch(resetStoreAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    moxios.uninstall(apiClientNode)
    moxios.uninstall(apiClientBackend)
    mockDispatchTestStore.mockClear()
    mockDispatchRealStore.mockClear()
    mockedAlignmentCommandApi.mockClear()
    mockedAlignmentStateApi.mockClear()
    mockedPolygonsApi.mockClear()
    jest.useRealTimers()
    WS.clean()
  })

  test('Should use a different text when skipping the final alignment', async () => {
    const notificationConfirmation: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      alignmentPhase: AlignmentPhase.FINAL,
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
      isFailure: true,
    }
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({
            state: AlignmentPhase.FINAL,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        ws.send(JSON.stringify(notificationConfirmation))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const proceedButton = component.getByTestId('alignment-buttons-proceed')
    await waitFor(
      () => {
        fireEvent.click(proceedButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    expect(
      screen.getByText(
        t('acquisition.alignment.skip_alert.text_final', 'Wrong') as string
      )
    ).toBeTruthy()
    // TODO: not working with testing store, need the real one
    // const okButton = component.getByTestId('alert-ok-button')
    // await waitFor(
    //   () => {
    //     fireEvent.click(okButton)
    //   },
    //   { timeout: 500 }
    // )
    // jest.advanceTimersByTime(500)
    // //
    // expect(mockedAlignmentCommandApi).toHaveBeenCalledWith({
    //   action: AlignmentCommand.SKIP,
    // })
  })
})

describe('AlignmentToast (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<AlignmentToast />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should display the title', () => {
    const title = component.getByTestId('alignment-title')
    expect(title).toBeTruthy()
  })

  test('Should display the text', () => {
    expect(component.getByTestId('alignment-text')).toBeTruthy()
  })

  test('The text should be translated', () => {
    const code = mockStore.alignmentService.alignmentState?.messageCode
    expect(
      component.getByText(
        t(`acquisition.alignment.messages.${code}`, 'Wrong') as string
      )
    ).toBeTruthy()
  })

  test('Should display the image', () => {
    const image = component.getByTestId('alignment-image')
    expect(image).toBeTruthy()
  })
})

describe('AlignmentToast (mockStore cancel)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<AlignmentToast />)(mockedStoreCancel)
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatchCancel.mockClear()
    jest.useFakeTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should dispatch an action when clicking on the cancel button', async () => {
    const button = component.getByTestId('alignment-buttons-cancel')
    await waitFor(
      () => {
        fireEvent.click(button)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatchCancel).toHaveBeenCalledWith(
      expect.objectContaining({
        type: getType(alignmentCommandActions.request),
      })
    )
  })

  test('Should dispatch NO action when clicking on the cancel button before a 1 sec interval', async () => {
    const button = component.getByTestId('alignment-buttons-cancel')
    mockDispatchCancel.mockClear()
    await waitFor(
      () => {
        fireEvent.click(button)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatchCancel).toHaveBeenCalledTimes(1)
    mockDispatchCancel.mockClear()
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    expect(mockDispatchCancel).toHaveBeenCalledTimes(0)
    await waitFor(() => {}, { timeout: 3000 })
    jest.advanceTimersByTime(3000)
    fireEvent.click(button)
    expect(mockDispatchCancel).toHaveBeenCalledTimes(1)
  })
})

describe('AlignmentToast (mockStore proceed)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<AlignmentToast />)(mockedStoreProceed)
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatchProceed.mockClear()
    jest.useFakeTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should dispatch an action when clicking on the proceed button', async () => {
    const button = component.getByTestId('alignment-buttons-proceed')
    await waitFor(
      () => {
        fireEvent.click(button)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatchProceed).toHaveBeenCalledWith(
      expect.objectContaining({
        type: getType(alignmentCommandActions.request),
      })
    )
  })

  test('Should dispatch NO action when clicking on the proceed button before a 1 sec interval', async () => {
    const button = component.getByTestId('alignment-buttons-proceed')
    mockDispatchProceed.mockClear()
    await waitFor(
      () => {
        fireEvent.click(button)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatchProceed).toHaveBeenCalledTimes(1)
    mockDispatchProceed.mockClear()
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    expect(mockDispatchProceed).toHaveBeenCalledTimes(0)
    await waitFor(() => {}, { timeout: 3000 })
    jest.advanceTimersByTime(3000)
    fireEvent.click(button)
    expect(mockDispatchProceed).toHaveBeenCalledTimes(1)
  })
})
