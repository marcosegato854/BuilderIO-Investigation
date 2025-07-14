/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import { JobGridItem } from 'components/molecules/JobGridItem/JobGridItem'
import moxios from 'moxios'
import { mergeDeepRight } from 'ramda'
import { Store } from 'redux'
import configureMockStore from 'redux-mock-store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import {
  dataStorageConfigActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { resetStoreAction } from 'store/features/global/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClientBackend from 'store/services/apiClientBackend'
import { renderWithProvider } from 'utils/test'

const job: IJob = {
  name: 'NewProject',
  creationdate: '2021-05-17T09:55:58Z',
  scans: 1,
  size: 0,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStoreNotProcessing: any = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: null,
    },
  })
)

const mockedStoreImageProcessing: any = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: [
        {
          disk: 'p',
          project: 'Project002',
          job: 'Job001',
          progress: 34,
          isImageAI: true,
        },
      ],
    },
  })
)

const mockedStoreExportProcessing: any = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: [
        {
          disk: 'p',
          project: 'Project002',
          job: 'Job001',
          progress: 34,
          options: {
            export: {
              lgsx: {
                enable: true,
                done: false,
              },
            },
          },
        },
      ],
    },
  })
)

const mockDispatch = jest.fn()
mockedStoreNotProcessing.dispatch = mockDispatch
mockedStoreImageProcessing.dispatch = mockDispatch
mockedStoreExportProcessing.dispatch = mockDispatch

describe('JobGridItem (store)', () => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  let store: Store
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>

  beforeEach(async () => {
    store = getTestingStore()
    mockDispatchRealStore = jest.spyOn(store, 'dispatch')
    // // mock API
    moxios.install(apiClientBackend)
    moxios.stubRequest('/user', {
      status: 200,
      response: {},
    })
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
        // office available
        store.dispatch(
          dataStorageConfigActions.success({
            Process: {
              office: { available: true, version: '1' },
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
        store.dispatch(resetStoreAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    mockDispatchRealStore.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    component = renderWithProvider(<JobGridItem job={job} />)(store)
    expect(component).toBeTruthy()
  })

  test('It should call a function on click with image', () => {
    component = renderWithProvider(<JobGridItem job={job} />)(store)
    const clickable = component.getByTestId('clickable-image')
    fireEvent.click(clickable)
    expect(mockDispatchRealStore).toHaveBeenCalledWith(
      expect.objectContaining({
        type: '@@router/CALL_HISTORY_METHOD',
      })
    )
  })

  test('It should call a function on click without image', () => {
    component = renderWithProvider(
      <JobGridItem job={{ ...job, image: 'asdfa' }} />
    )(store)
    const clickable = component.getByTestId('clickable-image')
    fireEvent.click(clickable)
    expect(mockDispatchRealStore).toHaveBeenCalledWith(
      expect.objectContaining({
        type: '@@router/CALL_HISTORY_METHOD',
      })
    )
  })

  test('It should call a function on click on title', () => {
    component = renderWithProvider(<JobGridItem job={job} />)(store)
    const clickable = component.getByTestId('clickable-title')
    fireEvent.click(clickable)
    expect(mockDispatchRealStore).toHaveBeenCalledWith(
      expect.objectContaining({
        type: '@@router/CALL_HISTORY_METHOD',
      })
    )
  })

  test('should NOT show processing buttons and progress if there is no process', () => {
    component = renderWithProvider(<JobGridItem job={job} />)(store)
    expect(
      screen.queryByTestId('processing-progress-bars')
    ).not.toBeInTheDocument()
  })

  test('should NOT show processing buttons and progress if there are no scans', () => {
    const localJob = mergeDeepRight(mockStore.dataStorageService.jobs[0]!, {
      scans: 0,
      acquired: false,
    }) as IJob
    component = renderWithProvider(<JobGridItem job={localJob} />)(store)
    expect(screen.queryByTestId('job-processing-icon')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('processing-progress-bars')
    ).not.toBeInTheDocument()
  })

  test('should display the open process icon when ready to process', () => {
    const localJob = mergeDeepRight(mockStore.dataStorageService.currentJob!, {
      acquired: true,
      scans: 1,
    }) as IJob
    component = renderWithProvider(<JobGridItem job={localJob} />)(
      mockedStoreNotProcessing
    )
    expect(screen.getByTestId('job-processing-icon')).toBeTruthy()
  })

  test('should display the pause icon if the job imageAI is processing', () => {
    const localJob = mergeDeepRight(mockStore.dataStorageService.currentJob!, {
      acquired: true,
      scans: 1,
    }) as IJob
    component = renderWithProvider(<JobGridItem job={localJob} />)(
      mockedStoreImageProcessing
    )
    expect(screen.getByTestId('image-processing-pause')).toBeTruthy()
  })

  test('should display the stop icon if the job is processing a colorization or export', () => {
    const localJob = mergeDeepRight(mockStore.dataStorageService.currentJob!, {
      scans: 1,
      acquired: true,
    }) as IJob
    component = renderWithProvider(<JobGridItem job={localJob} />)(
      mockedStoreExportProcessing
    )
    expect(screen.getByTestId('office-processing-stop')).toBeTruthy()
  })

  test('should NOT show processing icon if the job is processing', () => {
    const localJob = mergeDeepRight(mockStore.dataStorageService.currentJob!, {
      acquired: true,
      scans: 1,
    }) as IJob
    component = renderWithProvider(<JobGridItem job={localJob} />)(
      mockedStoreImageProcessing
    )
    expect(screen.queryByTestId('job-processing-icon')).not.toBeInTheDocument()
  })

  test('should display the play icon if the job is paused', () => {
    const localJob = mergeDeepRight(mockStore.dataStorageService.currentJob!, {
      acquired: true,
      scans: 1,
      processOutput: {
        progress: 45,
        isImageAIDone: false,
        options: {
          finalise: {
            blur: {
              enable: true,
            },
          },
        },
      },
    }) as IJob
    component = renderWithProvider(<JobGridItem job={localJob} />)(
      mockedStoreNotProcessing
    )
    expect(screen.getByTestId('image-processing-play')).toBeTruthy()
  })

  test('should dispatch a resume action if the play button is pressed', async () => {
    const localJob = mergeDeepRight(mockStore.dataStorageService.currentJob!, {
      acquired: true,
      scans: 1,
      processOutput: {
        progress: 45,
        isImageAIDone: false,
        options: {
          finalise: {
            blur: {
              enable: true,
            },
          },
        },
      },
    }) as IJob
    component = renderWithProvider(<JobGridItem job={localJob} />)(
      mockedStoreNotProcessing
    )
    const startIcon = component.getByTestId('image-processing-play')
    await waitFor(
      async () => {
        fireEvent.click(startIcon)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dataStorageService/START_PROCESSING_REQUEST',
        payload: expect.objectContaining({
          options: expect.objectContaining({
            finalise: expect.objectContaining({
              blur: {
                enable: true,
                done: false,
              },
            }),
          }),
        }),
      })
    )
  })

  test('should NOT show processing icon if the job is paused', () => {
    const localJob = mergeDeepRight(mockStore.dataStorageService.currentJob!, {
      acquired: true,
      scans: 1,
      processOutput: {
        progress: 45,
        isImageAIDone: false,
        options: {
          finalise: {
            blur: {
              enable: true,
            },
          },
        },
      },
    }) as IJob
    component = renderWithProvider(<JobGridItem job={localJob} />)(
      mockedStoreNotProcessing
    )
    expect(screen.queryByTestId('job-processing-icon')).not.toBeInTheDocument()
  })

  test('should show an alert if the pause button is pressed', async () => {
    const localJob = mergeDeepRight(mockStore.dataStorageService.currentJob!, {
      acquired: true,
      scans: 1,
    }) as IJob
    component = renderWithProvider(<JobGridItem job={localJob} />)(
      mockedStoreImageProcessing
    )
    const pauseIcon = component.getByTestId('image-processing-pause')
    await waitFor(
      async () => {
        fireEvent.click(pauseIcon)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dialogs/OPEN_DIALOG',
      })
    )
  })

  test('should dispatch a stop action if the stop button is pressed', async () => {
    const localJob = mergeDeepRight(mockStore.dataStorageService.currentJob!, {
      acquired: true,
      scans: 1,
    }) as IJob
    component = renderWithProvider(<JobGridItem job={localJob} />)(
      mockedStoreExportProcessing
    )
    const stopIcon = component.getByTestId('office-processing-stop')
    await waitFor(
      async () => {
        fireEvent.click(stopIcon)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dataStorageService/STOP_PROCESSING_REQUEST',
      })
    )
  })
})
