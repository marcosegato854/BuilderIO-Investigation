/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import NewJobForm from 'components/dialogs/NewJobForm/NewJobForm'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { t } from 'i18n/config'
import moment from 'moment'
import moxios from 'moxios'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { store } from 'store'
import { mkNewJob } from 'store/features/dataStorage/mockApi'
import {
  dataStorageJobTypesActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { resetStoreAction } from 'store/features/global/slice'
import { logWarning } from 'store/features/system/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import { getType } from 'typesafe-actions'
import { renderWithProvider } from 'utils/test'

const mockedStore = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

let component: RenderResult<typeof queries>
let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>
let mockedSaveJobApi: jest.SpyInstance<any>
const mockedLocalStorageGet: jest.Mock<any> = jest.fn(() => null)
const mockedLocalStorageSet: jest.Mock<any> = jest.fn(() => null)
const prepareMocks = async () => {
  mockDispatchRealStore = jest.spyOn(store, 'dispatch')
  jest.spyOn(global, 'fetch').mockResolvedValue({
    text: jest.fn().mockResolvedValue(''),
  } as any)
  mockedSaveJobApi = mkNewJob()
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
}

describe('NewJobForm (Store - no blur expiration)', () => {
  beforeEach(async () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockedLocalStorageGet,
        setItem: mockedLocalStorageSet,
      },
      writable: true,
    })
    await prepareMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    mockedSaveJobApi.mockClear()
    mockDispatchRealStore.mockClear()
    mockedLocalStorageGet.mockClear()
    mockedLocalStorageSet.mockClear()
    moxios.uninstall(apiClient)
    // moxios.uninstall(mockApiClientDiskManagement)
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  test('should display the image blur control', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    const imageBlurField = component.getByTestId('image-blur')
    expect(imageBlurField).toBeTruthy()
  })

  test('should trigger a confirm dialog when changing the image blur (no expiration)', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    const imageBlurField = component.getByTestId('image-blur')
    const offButton = within(imageBlurField).getByText(
      t('new_job_form.option.camera_blur.off', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(offButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const gdprLink = 'GDPR'
    const alertDialog = screen.getByTestId('alert-dialog')
    expect(within(alertDialog).getByText(gdprLink)).toBeTruthy()
  })

  test('should NOT display a warning icon beside the blur label if blur is enabled', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    expect(screen.queryByTestId('blur-warning-icon')).not.toBeInTheDocument()
  })

  test('should display a warning icon beside the blur label if blur is diabled', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    const imageBlurField = component.getByTestId('image-blur')
    const offButton = within(imageBlurField).getByText(
      t('new_job_form.option.camera_blur.off', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(offButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const warningIcon = within(imageBlurField).getByTestId('blur-warning-icon')
    expect(warningIcon).toBeTruthy()
  })

  test('should save to localStorage on checkbox selection', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    const imageBlurField = component.getByTestId('image-blur')
    const offButton = within(imageBlurField).getByText(
      t('new_job_form.option.camera_blur.off', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(offButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const alertDialog = screen.getByTestId('alert-dialog')
    const checkBox = within(alertDialog).getByTestId('alert-checkbox')
    await waitFor(
      () => {
        fireEvent.click(checkBox)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockedLocalStorageSet).toHaveBeenCalledWith(
      'blurExpiration',
      expect.any(String)
    )
  })

  test('should log the user chouce to the backend', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    const imageBlurField = component.getByTestId('image-blur')
    const offButton = within(imageBlurField).getByText(
      t('new_job_form.option.camera_blur.off', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(offButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const alertDialog = screen.getByTestId('alert-dialog')
    const checkBox = within(alertDialog).getByTestId('alert-checkbox')
    await waitFor(
      () => {
        fireEvent.click(checkBox)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatchRealStore).toHaveBeenCalledWith(
      expect.objectContaining({ type: getType(logWarning) })
    )
  })

  test('should clear localStorage on checkbox selection removal', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    const imageBlurField = component.getByTestId('image-blur')
    const offButton = within(imageBlurField).getByText(
      t('new_job_form.option.camera_blur.off', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(offButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const alertDialog = screen.getByTestId('alert-dialog')
    const checkBox = within(alertDialog).getByTestId('alert-checkbox')
    await waitFor(
      () => {
        fireEvent.click(checkBox)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        fireEvent.click(checkBox)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockedLocalStorageSet).toHaveBeenCalledWith('blurExpiration', '')
  })

  test('should send the image blur setting to the api', async () => {
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
              blur: true,
            }),
          }),
        }),
      })
    )
    expect(mockedSaveJobApi).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        camera: expect.objectContaining({
          blur: true,
        }),
      })
    )
  })

  test('should send the image blur setting to the api when disabled', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    const imageBlurField = component.getByTestId('image-blur')
    const offButton = within(imageBlurField).getByText(
      t('new_job_form.option.camera_blur.off', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(offButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
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
              blur: false,
            }),
          }),
        }),
      })
    )
  })
})

describe('NewJobForm (Store - blur expired)', () => {
  beforeEach(async () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => '2021-02-01T18:41:20+01:00'),
        setItem: mockedLocalStorageSet,
      },
      writable: true,
    })
    await prepareMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    mockedSaveJobApi.mockClear()
    mockDispatchRealStore.mockClear()
    mockedLocalStorageGet.mockClear()
    mockedLocalStorageSet.mockClear()
    moxios.uninstall(apiClient)
    // moxios.uninstall(mockApiClientDiskManagement)
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  test('should trigger a confirm dialog when changing the image blur', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    const imageBlurField = component.getByTestId('image-blur')
    const offButton = within(imageBlurField).getByText(
      t('new_job_form.option.camera_blur.off', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(offButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const gdprLink = 'GDPR'
    expect(screen.queryByText(gdprLink)).toBeInTheDocument()
  })
})

describe('NewJobForm (Store - blur NOT expired)', () => {
  beforeEach(async () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => moment(new Date()).subtract(1, 'day').format()),
        setItem: mockedLocalStorageSet,
      },
      writable: true,
    })
    await prepareMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    mockedSaveJobApi.mockClear()
    mockDispatchRealStore.mockClear()
    mockedLocalStorageGet.mockClear()
    mockedLocalStorageSet.mockClear()
    moxios.uninstall(apiClient)
    // moxios.uninstall(mockApiClientDiskManagement)
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  test('should NOT trigger a confirm dialog when changing the image blur', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    const imageBlurField = component.getByTestId('image-blur')
    const offButton = within(imageBlurField).getByText(
      t('new_job_form.option.camera_blur.off', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(offButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const gdprLink = 'GDPR'
    expect(screen.queryByText(gdprLink)).not.toBeInTheDocument()
  })
})
