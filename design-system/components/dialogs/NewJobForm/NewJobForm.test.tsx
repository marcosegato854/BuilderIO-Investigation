/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  RenderResult,
  fireEvent,
  queries,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import NewJobForm from 'components/dialogs/NewJobForm/NewJobForm'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { t } from 'i18n/config'
import moxios from 'moxios'
import { mergeDeepRight } from 'ramda'
import configureMockStore from 'redux-mock-store'
import { store } from 'store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import { getTestingStore as getTestingStoreCustomRoute } from 'store/configureTestingStoreCustomRoute'
import { mkJobUpdate, mkNewJob } from 'store/features/dataStorage/mockApi'
import {
  dataStorageJobTypesActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { resetStoreAction } from 'store/features/global/slice'
import { mkGetPlan, mkUpdatePlan } from 'store/features/planning/mockApi'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import { defaultNeeded } from 'utils/planning/polygonHelpers'
import { renderWithProvider } from 'utils/test'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('NewJobForm (mockStore)', () => {
  let component: RenderResult<typeof queries>
  const job = mockStore.dataStorageService.currentJob!
  beforeEach(async () => {
    jest.useFakeTimers()
    await waitFor(
      () => {
        component = renderWithProvider(
          <NewJobForm
            initialValues={mockStore.dataStorageService.currentJob || undefined}
          />
        )(mockedStore)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('triggers an action on submit', async () => {
    const submitButton = component.getByTestId('submit-button')
    fireEvent.click(submitButton)
    await waitFor(() => {}, { timeout: 200 })
    jest.advanceTimersByTime(200)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'dataStorageService/SUBMIT_JOB_FORM' })
    )
  })

  test('fills default values from props', () => {
    expect(
      component.getByDisplayValue(
        mockStore.dataStorageService.currentJob?.name || 'asdf'
      )
    ).toBeTruthy()
  })

  test('It should send the image to the API', async () => {
    const submitButton = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(submitButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          job: expect.objectContaining({
            image: job.image,
          }),
        }),
      })
    )
  })

  test('It should remove the image when clicking the delete button', async () => {
    expect(
      component.getByText(t('new_job_form.delete_thumbnail', 'wrong') as string)
    ).toBeTruthy()
    const deleteButton = component.getByTestId('delete-button')
    await waitFor(
      () => {
        fireEvent.click(deleteButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const submitButton = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(submitButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          job: expect.objectContaining({
            image: null,
          }),
        }),
      })
    )
    expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument()
    expect(
      component.getByText(t('new_job_form.add_a_thumbnail', 'wrong') as string)
    ).toBeTruthy()
  })

  test('It should NOT pass validation if the job name is shorter than 3 chars', async () => {
    const shortName = 'xy'
    const nameField = component.getByTestId('job-name-input')
    // enter the short name
    const input: HTMLInputElement = nameField.getElementsByTagName('input')[0]
    fireEvent.change(input, { target: { value: shortName } })
    // change focus to activate validation
    fireEvent.blur(input)
    await waitFor(
      () => {
        fireEvent.focus(input)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(
      component.getByText(t('new_job_form.validation.min3', 'wrong') as string)
    ).toBeTruthy()
  })

  test('It should NOT pass validation if the job name is longer than 25 chars', async () => {
    const longName = 'ThisIsAVeryToooooLongJobName'
    const nameField = component.getByTestId('job-name-input')
    // enter the long name
    const input: HTMLInputElement = nameField.getElementsByTagName('input')[0]
    fireEvent.change(input, { target: { value: longName } })
    // change focus to activate validation
    fireEvent.blur(input)
    await waitFor(
      () => {
        fireEvent.focus(input)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(
      component.getByText(t('new_job_form.validation.max', 'wrong') as string)
    ).toBeTruthy()
  })

  test('It should NOT pass validation if the job name does not match the regex', async () => {
    const wrongName = 'ThisIsA-*-wrongJobName'
    const nameField = component.getByTestId('job-name-input')
    // enter the wrong name
    const input: HTMLInputElement = nameField.getElementsByTagName('input')[0]
    fireEvent.change(input, { target: { value: wrongName } })
    // change focus to activate validation
    fireEvent.blur(input)
    await waitFor(
      () => {
        fireEvent.focus(input)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(
      component.getByText(
        t('new_job_form.validation.bad_characters', 'wrong') as string
      )
    ).toBeTruthy()
  })
})

describe('NewJobForm with RTK on (mockStore)', () => {
  let component: RenderResult<typeof queries>
  beforeEach(async () => {
    jest.useFakeTimers()
    await waitFor(
      () => {
        component = renderWithProvider(
          <NewJobForm
            initialValues={{
              ...mockStore.dataStorageService.currentJob!,
              ntrip: {
                enable: true,
              },
            }}
          />
        )(mockedStore)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('displays details button', async () => {
    const button = component.getByTestId('rtk-show-details')
    expect(button).toBeTruthy()
    await waitFor(
      () => {
        fireEvent.click(button)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: {
        component: 'RTKSettingsDialog',
        componentProps: {
          initialValues: expect.objectContaining({
            enable: true,
            connected: false,
          }),
        },
      },
      type: 'dialogs/OPEN_DIALOG',
    })
  })

  test('should display the image blur control', async () => {
    const imageBlurField = component.getByTestId('image-blur')
    expect(imageBlurField).toBeTruthy()
  })
})

describe('NewJobForm UPDATE JOB PLANNED (Store)', () => {
  let component: RenderResult<typeof queries>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>
  let mockedUpdateJobApi: jest.SpyInstance<any>
  let mockedGetPlanApi: jest.SpyInstance<any>
  let mockedUpdatePlanApi: jest.SpyInstance<any>

  const store = getTestingStoreCustomRoute(
    'd/projects/:diskName/:projectName/jobs'
  )

  beforeEach(async () => {
    mockDispatchRealStore = jest.spyOn(store, 'dispatch')
    jest.spyOn(global, 'fetch').mockResolvedValue({
      text: jest.fn().mockResolvedValue(''),
    } as any)
    mockedUpdateJobApi = mkJobUpdate()
    mockedGetPlanApi = mkGetPlan()
    mockedUpdatePlanApi = mkUpdatePlan()
    jest.useFakeTimers()
    moxios.install(apiClient)
    // moxios.install(mockApiClientDiskManagement)
    moxios.stubRequest('/datastorage/projects/p/Project002/jobs', {
      status: 200,
      response: { jobs: mockStore.dataStorageService.jobs },
    })
    moxios.stubRequest('/datastorage/jobtype', {
      status: 200,
      response: {
        jobtype: mockStore.dataStorageService.jobTypes,
      },
    })
    moxios.stubRequest('/position/supportedsatellites', {
      status: 200,
      response: {
        satellites: mockStore.positionService.supportedSatellites,
      },
    })
    // prepare the store
    await waitFor(
      () => {
        store.dispatch(
          dataStorageProjectDetailActions.success(
            mockStore.dataStorageService.currentProject!
          )
        )
        store.dispatch(
          dataStorageJobTypesActions.success({
            jobtype: mockStore.dataStorageService.jobTypes,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // render
    await waitFor(
      () => {
        component = renderWithProvider(
          <div>
            <DialogManager />
            <NewJobForm
              initialValues={mockStore.dataStorageService.currentJob}
            />
          </div>
        )(store)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    mockedUpdateJobApi.mockClear()
    mockedUpdatePlanApi.mockClear()
    mockedGetPlanApi.mockClear()
    mockDispatchRealStore.mockClear()
    moxios.uninstall(apiClient)
    // moxios.uninstall(mockApiClientDiskManagement)
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  // test('It should mount', () => {
  //   expect(component).toBeTruthy()
  // })

  test('should reset estimations if settings change', async () => {
    // switch off camera
    // TODO: remove camera part
    const cameraEnabledField = component.getByTestId('camera-enable-field')
    const offButton = within(cameraEnabledField).getByText(
      t('new_job_form.option.camera.on', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(offButton)
      },
      { timeout: 500 }
    )
    // submit
    const submit = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(submit)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatchRealStore).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: 'dataStorageService/SUBMIT_JOB_FORM',
        payload: expect.objectContaining({
          job: expect.objectContaining({
            camera: expect.objectContaining({
              enable: 1,
            }),
          }),
        }),
      })
    )
    expect(mockedUpdateJobApi).toHaveBeenCalledWith(
      expect.objectContaining({
        job: expect.objectContaining({
          camera: expect.objectContaining({
            enable: 1,
          }),
        }),
      })
    )
    expect(mockedGetPlanApi).toHaveBeenCalled()
    expect(mockedUpdatePlanApi).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: expect.objectContaining({
          needed: defaultNeeded(),
        }),
      })
    )
  })
})

describe('NewJobForm UPDATE JOB NOT PLANNED (Store)', () => {
  let component: RenderResult<typeof queries>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>
  let mockedUpdateJobApi: jest.SpyInstance<any>
  let mockedGetPlanApi: jest.SpyInstance<any>
  let mockedUpdatePlanApi: jest.SpyInstance<any>

  const store = getTestingStoreCustomRoute(
    'd/projects/:diskName/:projectName/jobs'
  )

  beforeEach(async () => {
    mockDispatchRealStore = jest.spyOn(store, 'dispatch')
    jest.spyOn(global, 'fetch').mockResolvedValue({
      text: jest.fn().mockResolvedValue(''),
    } as any)
    mockedUpdateJobApi = mkJobUpdate()
    mockedGetPlanApi = mkGetPlan()
    mockedUpdatePlanApi = mkUpdatePlan()
    jest.useFakeTimers()
    moxios.install(apiClient)
    // moxios.install(mockApiClientDiskManagement)
    moxios.stubRequest('/datastorage/projects/p/Project002/jobs', {
      status: 200,
      response: { jobs: mockStore.dataStorageService.jobs },
    })
    moxios.stubRequest('/datastorage/jobtype', {
      status: 200,
      response: {
        jobtype: mockStore.dataStorageService.jobTypes,
      },
    })
    moxios.stubRequest('/position/supportedsatellites', {
      status: 200,
      response: {
        satellites: mockStore.positionService.supportedSatellites,
      },
    })
    // prepare the store
    await waitFor(
      () => {
        store.dispatch(
          dataStorageProjectDetailActions.success(
            mockStore.dataStorageService.currentProject!
          )
        )
        store.dispatch(
          dataStorageJobTypesActions.success({
            jobtype: mockStore.dataStorageService.jobTypes,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // render
    const job = mergeDeepRight(mockStore.dataStorageService.currentJob, {
      planned: false,
    }) as IJob
    await waitFor(
      () => {
        component = renderWithProvider(
          <div>
            <DialogManager />
            <NewJobForm initialValues={job} />
          </div>
        )(store)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    mockedUpdateJobApi.mockClear()
    mockedUpdatePlanApi.mockClear()
    mockedGetPlanApi.mockClear()
    mockDispatchRealStore.mockClear()
    moxios.uninstall(apiClient)
    // moxios.uninstall(mockApiClientDiskManagement)
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  // test('It should mount', () => {
  //   expect(component).toBeTruthy()
  // })

  test('should not reset estimates if job is not planned', async () => {
    // switch off camera
    // TODO: remove camera part
    const cameraEnabledField = component.getByTestId('camera-enable-field')
    const offButton = within(cameraEnabledField).getByText(
      t('new_job_form.option.camera.on', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(offButton)
      },
      { timeout: 500 }
    )
    // submit
    const submit = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(submit)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatchRealStore).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: 'dataStorageService/SUBMIT_JOB_FORM',
      })
    )
    expect(mockedUpdateJobApi).toHaveBeenCalled()
    expect(mockedGetPlanApi).not.toHaveBeenCalled()
    expect(mockedUpdatePlanApi).not.toHaveBeenCalled()
  })
})

describe('NewJobForm NEW JOB (Store)', () => {
  let component: RenderResult<typeof queries>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>
  let mockedSaveJobApi: jest.SpyInstance<any>
  let mockedGetPlanApi: jest.SpyInstance<any>
  let mockedUpdatePlanApi: jest.SpyInstance<any>

  beforeEach(async () => {
    mockDispatchRealStore = jest.spyOn(store, 'dispatch')
    jest.spyOn(global, 'fetch').mockResolvedValue({
      text: jest.fn().mockResolvedValue(''),
    } as any)
    mockedSaveJobApi = mkNewJob()
    mockedGetPlanApi = mkGetPlan()
    mockedUpdatePlanApi = mkUpdatePlan()
    jest.useFakeTimers()
    moxios.install(apiClient)
    // moxios.install(mockApiClientDiskManagement)
    moxios.stubRequest('/datastorage/projects/p/Project002/jobs', {
      status: 200,
      response: { jobs: mockStore.dataStorageService.jobs },
    })
    moxios.stubRequest('/datastorage/jobtype', {
      status: 200,
      response: {
        jobtype: mockStore.dataStorageService.jobTypes,
      },
    })
    moxios.stubRequest('/position/supportedsatellites', {
      status: 200,
      response: {
        satellites: mockStore.positionService.supportedSatellites,
      },
    })
    // prepare the store
    await waitFor(
      () => {
        store.dispatch(
          dataStorageProjectDetailActions.success(
            mockStore.dataStorageService.currentProject!
          )
        )
        store.dispatch(
          dataStorageJobTypesActions.success({
            jobtype: mockStore.dataStorageService.jobTypes,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // render
    await waitFor(
      () => {
        component = renderWithProvider(
          <div>
            <DialogManager />
            <NewJobForm />
          </div>
        )(store)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    mockedSaveJobApi.mockClear()
    mockedUpdatePlanApi.mockClear()
    mockedGetPlanApi.mockClear()
    mockDispatchRealStore.mockClear()
    moxios.uninstall(apiClient)
    // moxios.uninstall(mockApiClientDiskManagement)
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  // test('It should mount', () => {
  //   expect(component).toBeTruthy()
  // })

  test('should not reset estimates if job is not updated', async () => {
    // submit
    const submit = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(submit)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockedSaveJobApi).toHaveBeenCalled()
    expect(mockedGetPlanApi).not.toHaveBeenCalled()
    expect(mockedUpdatePlanApi).not.toHaveBeenCalled()
  })
})

describe('NewJobForm ACQUISITION (mockStore)', () => {
  let component: RenderResult<typeof queries>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>
  let mockedUpdateJobApi: jest.SpyInstance<any>
  let mockedGetPlanApi: jest.SpyInstance<any>
  let mockedUpdatePlanApi: jest.SpyInstance<any>

  const store = getTestingStore()

  beforeEach(async () => {
    mockDispatchRealStore = jest.spyOn(store, 'dispatch')
    jest.spyOn(global, 'fetch').mockResolvedValue({
      text: jest.fn().mockResolvedValue(''),
    } as any)
    mockedUpdateJobApi = mkJobUpdate()
    mockedGetPlanApi = mkGetPlan()
    mockedUpdatePlanApi = mkUpdatePlan()
    jest.useFakeTimers()
    moxios.install(apiClient)
    // moxios.install(mockApiClientDiskManagement)
    moxios.stubRequest('/datastorage/projects/p/Project002/jobs', {
      status: 200,
      response: { jobs: mockStore.dataStorageService.jobs },
    })
    moxios.stubRequest('/datastorage/jobtype', {
      status: 200,
      response: {
        jobtype: mockStore.dataStorageService.jobTypes,
      },
    })
    moxios.stubRequest('/position/supportedsatellites', {
      status: 200,
      response: {
        satellites: mockStore.positionService.supportedSatellites,
      },
    })
    // prepare the store
    await waitFor(
      () => {
        store.dispatch(
          dataStorageProjectDetailActions.success(
            mockStore.dataStorageService.currentProject!
          )
        )
        store.dispatch(
          dataStorageJobTypesActions.success({
            jobtype: mockStore.dataStorageService.jobTypes,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // render
    await waitFor(
      () => {
        component = renderWithProvider(
          <div>
            <DialogManager />
            <NewJobForm
              initialValues={mockStore.dataStorageService.currentJob}
            />
          </div>
        )(store)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    mockedUpdateJobApi.mockClear()
    mockedUpdatePlanApi.mockClear()
    mockedGetPlanApi.mockClear()
    mockDispatchRealStore.mockClear()
    moxios.uninstall(apiClient)
    // moxios.uninstall(mockApiClientDiskManagement)
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should not reset estimates if job is updated during acquisition', async () => {
    // submit
    const submit = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(submit)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockedUpdateJobApi).toHaveBeenCalled()
    expect(mockedGetPlanApi).not.toHaveBeenCalled()
    expect(mockedUpdatePlanApi).not.toHaveBeenCalled()
  })
})
