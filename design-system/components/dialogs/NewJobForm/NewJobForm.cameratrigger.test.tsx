/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  waitFor,
  within,
  act,
} from '@testing-library/react'
import NewJobForm from 'components/dialogs/NewJobForm/NewJobForm'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { t } from 'i18n/config'
import moxios from 'moxios'
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

describe('NewJobForm Camera Trigger (Store Standard User)', () => {
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

  test('should have only two options for camera enable', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    const cameraEnableField = component.getByTestId('camera-enable-field')
    const options = within(cameraEnableField).getAllByTestId('selectbox-option')
    expect(options).toHaveLength(2)
  })
})

describe('NewJobForm Camera Trigger (Store Admin User)', () => {
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
    mockGetUserInfoAPI = mkUserInfo({
      usertype: 'service',
    })
    jest.useFakeTimers()
    // login
    await waitFor(
      () => {
        store.dispatch(
          loginActions.success({
            authorization: 'bearer D98LCBI8H',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    mockGetUserInfoAPI.mockClear()
    mockedSaveJobApi.mockClear()
    mockDispatchRealStore.mockClear()
    mockedLocalStorageGet.mockClear()
    mockedLocalStorageSet.mockClear()
    moxios.uninstall(apiClient)
    // moxios.uninstall(mockApiClientDiskManagement)
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  test('should be logged as admin', async () => {
    const state = await store.getState()
    const isLoggedIn = await selectIsLoggedIn(state)
    const isAdmin = await selectIsAdmin(state)
    expect(isLoggedIn).toBeTruthy()
    expect(isAdmin).toBeTruthy()
  })

  test('should have three options for camera enable', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    const cameraEnableField = component.getByTestId('camera-enable-field')
    const options = within(cameraEnableField).getAllByTestId('selectbox-option')
    expect(options).toHaveLength(3)
  })

  test('should have a field for camera elapse', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    const cameraElapseField = component.getByTestId('camera-elapse-field')
    expect(cameraElapseField).toBeTruthy()
  })

  test('should translate camera elapse field', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    const cameraElapseField = component.getByText(
      t('new_job_form.camera_elapse', 'wrong') as string
    )
    expect(cameraElapseField).toBeTruthy()
  })

  test('should dispatch the elapse field', async () => {
    const showDetailsButton = component.getByTestId('show-details')
    fireEvent.click(showDetailsButton)
    const cameraEnableField = component.getByTestId('camera-enable-field')
    // select the time option
    const timeButton = within(cameraEnableField).getByText(
      t('new_job_form.option.camera.time', 'wrong') as string
    )
    await act(async () => {
      await waitFor(
        () => {
          fireEvent.click(timeButton)
        },
        { timeout: 500 }
      )
      jest.advanceTimersByTime(500)
    })
    const cameraElapseField = component.getByTestId('camera-elapse-field')
    const cameraElapseControl =
      within(cameraElapseField).getByTestId('custom-slider')
    // these two events end up updating the camera distance to 10
    await fireEvent.mouseDown(cameraElapseControl, {
      clientX: 162,
      clientY: 302,
    })
    await fireEvent.mouseUp(cameraElapseControl, {
      clientX: 162,
      clientY: 302,
    })
    // submit
    const submitButton = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(submitButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatchRealStore).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dataStorageService/SUBMIT_JOB_FORM',
        payload: expect.objectContaining({
          job: expect.objectContaining({
            camera: expect.objectContaining({
              enable: 2,
              elapse: 2000,
            }),
          }),
        }),
      })
    )
  })
})
