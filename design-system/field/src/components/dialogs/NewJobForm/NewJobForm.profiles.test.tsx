/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { DialogNames } from 'components/dialogs/dialogNames'
import NewJobForm from 'components/dialogs/NewJobForm/NewJobForm'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { t } from 'i18n/config'
import moment from 'moment'
import moxios from 'moxios'
import { mergeDeepRight } from 'ramda'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { store } from 'store'
import { mkNewJob } from 'store/features/dataStorage/mockApi'
import {
  dataStorageJobTypesActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { JobType } from 'store/features/dataStorage/types'
import { openDialogAction } from 'store/features/dialogs/slice'
import { resetStoreAction } from 'store/features/global/slice'
import { logWarning } from 'store/features/system/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import { getType } from 'typesafe-actions'
import { renderWithProvider } from 'utils/test'

const mockedStore = configureMockStore()(mockStore)

/** CustomJobType */
const customProfile = mergeDeepRight(mockStore.dataStorageService.jobTypes[2], {
  name: 'CustomBoat',
  camera: {
    enable: 0,
    distance: 1.0,
  },
})

const jobTypes: JobType[] = [
  ...mockStore.dataStorageService.jobTypes,
  customProfile,
]

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
      jobtype: jobTypes,
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
          jobtype: jobTypes,
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

describe('NewJobForm Profiles (Store)', () => {
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

  test('should display Custom on the job profile when a default type is customized', async () => {
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
    expect(
      component.getByText(
        t('new_job_form.option.job_type.custom', 'wrong') as string
      )
    ).toBeTruthy()
  })

  test('should keep the profile name on the job profile when a custom type is customized', async () => {
    // select custom job
    const jobTypeSelect = component.getByText(jobTypes[0].name)
    await waitFor(
      () => {
        fireEvent.mouseDown(jobTypeSelect)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const customOption = screen.getByText(jobTypes[3].name)
    await waitFor(
      () => {
        fireEvent.click(customOption)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // show details
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    const imageBlurField = component.getByTestId('image-blur')
    // disable blur
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
    // test
    expect(component.getByText(jobTypes[3].name)).toBeTruthy()
  })

  test('should NOT display a dialog if the settings are NOT customized from a saved profile', async () => {
    // open details
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    // click submit
    const submitButton = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(submitButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(screen.getByText('Road')).toBeTruthy()
    expect(screen.queryByTestId('new-job-type-dialog')).not.toBeInTheDocument()
  })

  test('should display a dialog if the settings are customized and not saved in a profile', async () => {
    // open details
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    // change a setting
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
    // click submit
    const submitButton = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(submitButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(screen.getByTestId('new-job-type-dialog')).toBeTruthy()
  })
})
