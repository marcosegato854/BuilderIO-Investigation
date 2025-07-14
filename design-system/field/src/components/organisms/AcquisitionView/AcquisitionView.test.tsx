/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  RenderResult,
  fireEvent,
  queries,
  screen,
} from '@testing-library/react'
import { AcquisitionView } from 'components/organisms/AcquisitionView/AcquisitionView'
import { DeepPartial, mergeDeepRight } from 'ramda'
import configureMockStore from 'redux-mock-store'
import { OptimizedRootState as OptimizedRootStateActions } from 'store/features/actions/slice'
import { OptimizedRootState as OptimizedRootStateDataStorage } from 'store/features/dataStorage/slice'
import {
  OptimizedRootState as OptimizedRootStatePositionService,
  planTracksVisibleAction,
} from 'store/features/position/slice'
import { ViewMode } from 'store/features/position/types'
import {
  OptimizedRootState as OptimizedRootStateRouting,
  autocaptureNeededActions,
  autocaptureStatusActions,
  routingPolylineActions,
  routingStatusActions,
} from 'store/features/routing/slice'
import { OptimizedRootState as OptimizedRootStatePlanning } from 'store/features/planning/slice'
import { systemStateActions } from 'store/features/system/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import { mockAutcapturePolygons } from 'store/mock/mockAutocapturePolygons'

describe('AcquisitionView (mockStore - planned)', () => {
  let component: RenderResult<typeof queries>
  const overrideDataStorage: DeepPartial<OptimizedRootStateDataStorage> = {
    dataStorageService: {
      currentJob: { planned: true },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, overrideDataStorage)
  const mockedStore = configureMockStore()(mergedStore)
  const mockDispatch = jest.spyOn(mockedStore, 'dispatch')

  beforeEach(() => {
    component = renderWithProvider(<AcquisitionView />)(mockedStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display maps copyright', () => {
    expect(component.getByTestId('tiles-copyright')).toBeTruthy()
  })

  test('should update routing enabled status at mount if planned', () => {
    mockedStore.dispatch(systemStateActions.success({ state: 'Logging' }))
    expect(mockDispatch).toHaveBeenCalledWith(routingStatusActions.request())
  })

  test('should update autocapture enabled status at mount if planned', () => {
    mockedStore.dispatch(systemStateActions.success({ state: 'Logging' }))
    expect(mockDispatch).toHaveBeenCalledWith(
      autocaptureStatusActions.request()
    )
  })

  test('should update autocapture estimations at mount if planned', () => {
    expect(mockDispatch).toHaveBeenCalledWith(
      autocaptureNeededActions.request()
    )
  })

  // TODO deactivated for a bug with the swiper
  /* test('should reset routing at unmount', async () => {
    await waitFor(
      () => {
        component.unmount()
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(resetRoutingAction())
  }) */
})

describe('AcquisitionView (mockStore - planned - recording - manual track)', () => {
  let component: RenderResult<typeof queries>
  const overrideDataStorage: DeepPartial<OptimizedRootStateDataStorage> = {
    dataStorageService: {
      currentJob: { planned: true, scans: 1 },
    },
  }
  const overrideActions: DeepPartial<OptimizedRootStateActions> = {
    actionsService: {
      recordingStatus: 'done',
    },
  }
  const overrideRouting: DeepPartial<OptimizedRootStateRouting> = {
    routingService: {
      autocaptureCurrentPolygon: null,
    },
  }
  const mergedStore = mergeDeepRight(mockStore, {
    ...overrideDataStorage,
    ...overrideActions,
    ...overrideRouting,
  })
  const mockedStore = configureMockStore()(mergedStore)
  const mockDispatch = jest.spyOn(mockedStore, 'dispatch')

  beforeEach(() => {
    component = renderWithProvider(<AcquisitionView />)(mockedStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display only the job name and the scan name', () => {
    const expectedText = `${mergedStore.dataStorageService.currentJob.name}`
    expect(component.getByText(expectedText)).toBeTruthy()
  })
})

describe('AcquisitionView (mockStore - planned - recording - polygon track)', () => {
  let component: RenderResult<typeof queries>
  const overrideActions: DeepPartial<OptimizedRootStateActions> = {
    actionsService: {
      recordingStatus: 'done',
    },
  }
  const overrideRouting: DeepPartial<OptimizedRootStateRouting> = {
    routingService: {
      autocaptureCurrentPolygon: mockAutcapturePolygons[2],
    },
  }
  const mergedStore = mergeDeepRight(mockStore, {
    ...overrideActions,
    ...overrideRouting,
  }) as any
  const mockedStore = configureMockStore()(mergedStore)
  const mockDispatch = jest.spyOn(mockedStore, 'dispatch')

  beforeEach(() => {
    component = renderWithProvider(<AcquisitionView />)(mockedStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display only the job name and the polygon planned track name', () => {
    const expectedText = `${mergedStore.dataStorageService.currentJob.name}: ${mergedStore.routingService.autocapturePolygons[2].paths[0].name}`
    expect(component.getByText(expectedText)).toBeTruthy()
  })
})

describe('AcquisitionView (mockStore - planned - recording - single track)', () => {
  let component: RenderResult<typeof queries>
  const overrideActions: DeepPartial<OptimizedRootStateActions> = {
    actionsService: {
      recordingStatus: 'done',
    },
  }
  const overrideRouting: DeepPartial<OptimizedRootStateRouting> = {
    routingService: {
      autocaptureCurrentPolygon: mockAutcapturePolygons[3],
    },
  }
  const mergedStore = mergeDeepRight(mockStore, {
    ...overrideActions,
    // ...overridePlanning,
    ...overrideRouting,
  }) as any
  const mockedStore = configureMockStore()(mergedStore)
  const mockDispatch = jest.spyOn(mockedStore, 'dispatch')

  beforeEach(() => {
    component = renderWithProvider(<AcquisitionView />)(mockedStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display only the job name and the polygon planned track name', () => {
    const expectedText = `${mergedStore.dataStorageService.currentJob.name}: ${mergedStore.routingService.autocapturePolygons[3].name}`
    expect(component.getByText(expectedText)).toBeTruthy()
  })
})

// describe('AcquisitionView (mockStore - planned - polygon - recording - planned track)', () => {
//   let component: RenderResult<typeof queries>
//   const overrideActions: DeepPartial<OptimizedRootStateActions> = {
//     actionsService: {
//       recordingStatus: 'done',
//     },
//   }
//   const overridePlanning: DeepPartial<OptimizedRootStatePlanning> = {
//     planningService: {
//       currentPolygonId: 10,
//     },
//   }
//   // const overrideRouting: DeepPartial<OptimizedRootStateRouting> = {
//   //   routingService: {
//   //     autocaptureCurrentPolygon: mockAutcapturePolygons[0],
//   //   },
//   // }
//   const mergedStore = mergeDeepRight(mockStore, {
//     ...overrideActions,
//     ...overridePlanning,
//     // ...overrideRouting,
//   }) as any
//   const mockedStore = configureMockStore()(mergedStore)
//   const mockDispatch = jest.spyOn(mockedStore, 'dispatch')

//   beforeEach(() => {
//     component = renderWithProvider(<AcquisitionView />)(mockedStore)
//     jest.useFakeTimers()
//   })

//   afterEach(() => {
//     mockDispatch.mockClear()
//     jest.useRealTimers()
//   })

//   test('It should mount', () => {
//     expect(component).toBeTruthy()
//   })
//   test('It should display only the job name and the planned track name', () => {
//     const expectedText = `${mergedStore.dataStorageService.currentJob.name}: ${mergedStore.routingService.autocaptureCurrentPolygon.name}`
//     console.log('planned ');
//     expect(component.getByText(expectedText)).toBeTruthy()
//   })
// })

describe('AcquisitionView (mockStore - not planned)', () => {
  let component: RenderResult<typeof queries>
  const overrideDataStorage: DeepPartial<OptimizedRootStateDataStorage> = {
    dataStorageService: {
      currentJob: { planned: false },
    },
  }

  const mergedStore = mergeDeepRight(mockStore, overrideDataStorage)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mergedStore)
  const mockDispatch = jest.spyOn(mockedStore, 'dispatch')

  beforeEach(() => {
    component = renderWithProvider(<AcquisitionView />)(mockedStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display only the job name', () => {
    expect(
      component.getByText(mergedStore.dataStorageService.currentJob.name)
    ).toBeTruthy()
  })

  test('should not update routing enabled status at mount if not planned', () => {
    expect(mockDispatch).not.toHaveBeenCalledWith(
      routingStatusActions.request()
    )
  })

  test('should not update autocapture enabled status at mount if not planned', () => {
    expect(mockDispatch).not.toHaveBeenCalledWith(
      autocaptureStatusActions.request()
    )
  })

  test('should not update routing polyline at mount if not planned', () => {
    expect(mockDispatch).not.toHaveBeenCalledWith(
      routingPolylineActions.request()
    )
  })

  test('should not update autocapture estimations at mount if not planned', () => {
    expect(mockDispatch).not.toHaveBeenCalledWith(
      autocaptureNeededActions.request()
    )
  })

  // TODO deactivated for a bug with the swiper
  /* test('should reset routing at unmount', async () => {
    await waitFor(
      () => {
        component.unmount()
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(resetRoutingAction())
  }) */

  // TODO it needs to be fixed with node 14
  /* test('removal notifications should be filtered out', async () => {
    const button = component.getByTestId('button-errors')
    await waitFor(
      () => {
        fireEvent.click(button)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const expectedNotifications = mockStore.system.notifications.filter(
      (n: SystemNotification) => n.type !== SystemNotificationType.REMOVE
    )
    expect(component.getAllByTestId('system-notification').length).toBe(
      expectedNotifications.length
    )
  }) */
})

describe('AcquisitionView (mockStore - not planned - recording)', () => {
  let component: RenderResult<typeof queries>
  const overrideActions: DeepPartial<OptimizedRootStateActions> = {
    actionsService: {
      recordingStatus: 'done',
    },
  }
  const overrideDataStorage: DeepPartial<OptimizedRootStateDataStorage> = {
    dataStorageService: {
      currentJob: { planned: false, scans: 1 },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, {
    ...overrideActions,
    ...overrideDataStorage,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mergedStore)
  const mockDispatch = jest.spyOn(mockedStore, 'dispatch')

  beforeEach(() => {
    component = renderWithProvider(<AcquisitionView />)(mockedStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  // TODO: autocapture - needs a version with the polygon track
  test('It should display only the job name and the scan name', () => {
    const expectedText = `${mergedStore.dataStorageService.currentJob.name}: Track001`
    expect(component.getByText(expectedText)).toBeTruthy()
  })
})

// TODO it needs to be fixed with node 14
// describe('AcquisitionView (realStore)', () => {
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
//   let component: RenderResult<typeof queries>
//   let mockConsoleError: jest.SpyInstance<any>
//   let mockedRoutingPolyline: jest.SpyInstance<any>
//   let mockedRoutingEnabled: jest.SpyInstance<any>
//   let mockedRoutingNeeded: jest.SpyInstance<any>
//   let mockedRoutingPolygons: jest.SpyInstance<any>
//   let mockedRoutingCurrentPath: jest.SpyInstance<any>
//   let mockedRoutingAlignment: jest.SpyInstance<any>
//   let mockedProjectDetail: jest.SpyInstance<any>
//   let mockedCameraExposure: jest.SpyInstance<any>
//   let mockedCameraTrigger: jest.SpyInstance<any>
//   let mockedDatastorageState: jest.SpyInstance<any>
//   let mockedAlignmentState: jest.SpyInstance<any>

// beforeEach(async () => {
//   mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
//   mockedRoutingPolyline = mkRoutingPolyline()
//   mockedRoutingEnabled = mkRoutingEnabled({ enabled: false })
//   mockedRoutingNeeded = mkRoutingNeeded()
//   mockedRoutingPolygons = mkRoutingPolygons()
//   mockedRoutingCurrentPath = mkRoutingCurrentPath()
//   mockedRoutingAlignment = mkRoutinAlignment()
//   mockedProjectDetail = mkProjectDetail()
//   mockedCameraExposure = mkCameraExposure()
//   mockedCameraTrigger = mkCameraTrigger()
//   mockedDatastorageState = mkDataStorageState()
//   mockedAlignmentState = mkAlignmentStatus()
//   /** mock API */
//   moxios.install(apiClient)
//   moxios.stubRequest('/system/actionstartrecording', {
//     status: 200,
//     response: {
//       action: {
//         status: 'progress',
//         progress: 50,
//         description: 'starting recording',
//       },
//     },
//   })
//   moxios.stubRequest('/system/actionstoprecording', {
//     status: 200,
//     response: {
//       action: {
//         status: 'progress',
//         progress: 50,
//         description: 'starting recording',
//       },
//     },
//   })
//   /** render */
//   component = renderWithProvider(<AcquisitionView />)(store)
//   //
//   // enable fake timers
//   jest.useFakeTimers()
//   await waitFor(
//     () => {
//       // fill the project
//       store.dispatch(
//         dataStorageProjectDetailActions.success({
//           disk: 'p',
//           jobs: 0,
//           name: 'test',
//           completed: 0,
//         })
//       )
//       // set system state
//       store.dispatch(
//         systemStateActions.success({
//           state: 'Logging',
//         })
//       )
//       // set alignment state
//       store.dispatch(
//         alignmentMessageAction({
//           ...mockStore.alignmentService.alignmentState!,
//           alignmentPhase: AlignmentPhase.INITIAL_DONE,
//         })
//       )
//       store.dispatch(
//         modulesActions.success({ modules: mockStore.system.modules })
//       )
//     },
//     { timeout: 500 }
//   )
//   jest.advanceTimersByTime(500)
// })

// afterEach(() => {
//   moxios.uninstall(apiClient)
//   mockedRoutingPolyline.mockClear()
//   mockedRoutingEnabled.mockClear()
//   mockedRoutingCurrentPath.mockClear()
//   mockedRoutingAlignment.mockClear()
//   mockedRoutingNeeded.mockClear()
//   mockedRoutingPolygons.mockClear()
//   mockedProjectDetail.mockClear()
//   mockedCameraExposure.mockClear()
//   mockedCameraTrigger.mockClear()
//   mockedDatastorageState.mockClear()
//   mockConsoleError.mockClear()
//   mockedAlignmentState.mockClear()
//   store.dispatch(resetStoreAction())
// })

// TODO it needs to be fixed with node 14
/* test('should NOT call polyline API if not planned', async () => {
    // reset state
    await waitFor(
      () => {
        store.dispatch(systemStateActions.success({ state: 'Activated' }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(screen.queryByTestId('progress-message')).not.toBeInTheDocument()
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({ state: 'StartingRecording' })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockedRoutingPolyline).not.toHaveBeenCalled()
  }) */

// TODO it needs to be fixed with node 14
/* test('should call polyline API if planned and routing enabled', async () => {
    mockedRoutingEnabled.mockClear()
    mockedRoutingEnabled = mkRoutingEnabled()
    // reset state
    await waitFor(
      () => {
        store.dispatch(
          dataStorageJobDetailActions.success({
            job: mergeDeepRight(mockStore.dataStorageService.currentJob, {
              planned: true,
            }) as IJob,
          })
        )
        store.dispatch(systemStateActions.success({ state: 'Activated' }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(screen.queryByTestId('progress-message')).not.toBeInTheDocument()
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({ state: 'StartingRecording' })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockedRoutingPolyline).toHaveBeenCalled()
  }) */

// TODO it needs to be fixed with node 14
/* test('should NOT call polyline API if routing is not enabled', async () => {
    // reset state
    await waitFor(
      () => {
        store.dispatch(
          dataStorageJobDetailActions.success({
            job: mergeDeepRight(mockStore.dataStorageService.currentJob, {
              planned: true,
            }) as IJob,
          })
        )
        store.dispatch(routingEnabledActions.success({ enabled: false }))
        store.dispatch(systemStateActions.success({ state: 'Activated' }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(screen.queryByTestId('progress-message')).not.toBeInTheDocument()
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({ state: 'StartingRecording' })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockedRoutingPolyline).not.toHaveBeenCalled()
  }) */
// })

describe('AcquisitionView (mockStore - planned - plan tracks are visible)', () => {
  let component: RenderResult<typeof queries>
  const overrideDataStorage: DeepPartial<OptimizedRootStateDataStorage> = {
    dataStorageService: {
      currentJob: { planned: true },
    },
  }
  const overridePositionService: DeepPartial<OptimizedRootStatePositionService> =
    {
      positionService: {
        viewMode: ViewMode.MAP,
      },
    }
  const mergedStore = mergeDeepRight(mockStore, {
    ...overrideDataStorage,
    ...overridePositionService,
  })
  const mockedStorePlan = configureMockStore()(mergedStore)
  const mockDispatchPlan = jest.spyOn(mockedStorePlan, 'dispatch')

  beforeEach(() => {
    component = renderWithProvider(<AcquisitionView />)(mockedStorePlan)
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatchPlan.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display show / hide planned tracks option', () => {
    expect(component.getByTestId('planned_tracks')).toBeTruthy()
  })

  test('It should present the icon activated', () => {
    const planIcon = component.getByTestId('planned_tracks')
    expect(planIcon.className).toContain('selected')
  })

  test('It should dispatch an action when hide plan is clicked', () => {
    const planIcon = component.getByTestId('planned_tracks')
    fireEvent.click(planIcon)
    expect(mockDispatchPlan).toHaveBeenCalledWith(
      planTracksVisibleAction(false)
    )
  })
})

describe('AcquisitionView (mockStore - planned - plan tracks are hidden)', () => {
  let component: RenderResult<typeof queries>
  const overrideDataStorage: DeepPartial<OptimizedRootStateDataStorage> = {
    dataStorageService: {
      currentJob: { planned: true },
    },
  }
  const overridePositionService: DeepPartial<OptimizedRootStatePositionService> =
    {
      positionService: {
        viewMode: ViewMode.MAP,
        planTracksVisible: false,
      },
    }
  const mergedStore = mergeDeepRight(mockStore, {
    ...overrideDataStorage,
    ...overridePositionService,
  })
  const mockedStore = configureMockStore()(mergedStore)
  const mockDispatch = jest.spyOn(mockedStore, 'dispatch')

  beforeEach(() => {
    component = renderWithProvider(<AcquisitionView />)(mockedStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display show / hide planned tracks option', () => {
    expect(component.getByTestId('planned_tracks')).toBeTruthy()
  })

  test('It should present the icon de-activated', () => {
    const planIcon = component.getByTestId('planned_tracks')
    expect(planIcon.className).not.toContain('selected')
  })

  test('It should dispatch an action when show plan is clicked', () => {
    const planIcon = component.getByTestId('planned_tracks')
    fireEvent.click(planIcon)
    expect(mockDispatch).toHaveBeenCalledWith(planTracksVisibleAction(true))
  })
})

describe('AcquisitionView (mockStore - not planned - plan tracks are not present)', () => {
  let component: RenderResult<typeof queries>
  const overrideDataStorage: DeepPartial<OptimizedRootStateDataStorage> = {
    dataStorageService: {
      currentJob: { planned: false },
    },
  }
  const overridePositionService: DeepPartial<OptimizedRootStatePositionService> =
    {
      positionService: {
        viewMode: ViewMode.MAP,
      },
    }
  const mergedStore = mergeDeepRight(mockStore, {
    ...overrideDataStorage,
    ...overridePositionService,
  })
  const mockedStore = configureMockStore()(mergedStore)
  const mockDispatch = jest.spyOn(mockedStore, 'dispatch')

  beforeEach(() => {
    component = renderWithProvider(<AcquisitionView />)(mockedStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should NOT display show / hide planned tracks option', () => {
    expect(screen.queryByTestId('planned_tracks')).not.toBeInTheDocument()
  })
})
