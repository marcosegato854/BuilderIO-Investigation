/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  waitFor,
  within,
} from '@testing-library/react'
import NewJobForm from 'components/dialogs/NewJobForm/NewJobForm'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { t } from 'i18n/config'
import moxios from 'moxios'
import { mergeDeepRight } from 'ramda'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { store } from 'store'
import { mkUserInfo } from 'store/features/auth/mockApi'
import {
  loginActions,
  selectIsAdmin,
  selectIsLoggedIn,
} from 'store/features/auth/slice'
import { mkNewJob } from 'store/features/dataStorage/mockApi'
import {
  dataStorageJobTypesActions,
  dataStorageProjectDetailActions,
  dataStorageTempJob,
  selectDataStorageTempJob,
} from 'store/features/dataStorage/slice'
import { resetStoreAction } from 'store/features/global/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
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

describe('NewJobForm DMI (Store Road Profile)', () => {
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

  test('should have road profile', async () => {
    const state = await store.getState()
    const tempJob = await selectDataStorageTempJob(state)
    const profile = tempJob?.profile
    expect(profile).toBe(0)
  })

  test('should have three options for DMI', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    const dmiField = component.getByTestId('dmi-field')
    const options = within(dmiField).getAllByTestId('selectbox-option')
    expect(options).toHaveLength(3)
  })
})

describe('NewJobForm Camera Trigger (Store Rail Profile)', () => {
  let mockGetUserInfoAPI: jest.SpyInstance<any>
  beforeEach(async () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockedLocalStorageGet,
        setItem: mockedLocalStorageSet,
      },
      writable: true,
    })
    await prepareMocks()
    jest.useFakeTimers()
    // prepare the store
    await waitFor(
      () => {
        store.dispatch(
          dataStorageTempJob(
            mergeDeepRight(mockStore.dataStorageService.currentJob, {
              profile: 1,
            }) as IJob
          )
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    // mockGetUserInfoAPI.mockClear()
    mockedSaveJobApi.mockClear()
    mockDispatchRealStore.mockClear()
    mockedLocalStorageGet.mockClear()
    mockedLocalStorageSet.mockClear()
    moxios.uninstall(apiClient)
    // moxios.uninstall(mockApiClientDiskManagement)
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  test('should have rail profile', async () => {
    const state = await store.getState()
    const tempJob = await selectDataStorageTempJob(state)
    const profile = tempJob?.profile
    expect(profile).toBe(1)
  })

  test('should have four options for DMI', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    const dmiField = component.getByTestId('dmi-field')
    const options = within(dmiField).getAllByTestId('selectbox-option')
    expect(options).toHaveLength(4)
  })

  test('should have Rail DMI option translated', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    expect(
      component.getByText(t('new_job_form.option.dmi.rail', 'wrong') as string)
    ).toBeTruthy()
  })
})
