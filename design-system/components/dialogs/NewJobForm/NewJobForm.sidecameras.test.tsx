/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  waitFor,
} from '@testing-library/react'
import NewJobForm from 'components/dialogs/NewJobForm/NewJobForm'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
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

describe('NewJobForm Sidecameras (Store)', () => {
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

  test('should send the left orientation setting to the api', async () => {
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
              left: expect.objectContaining({
                orientation: undefined,
              }),
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
          left: expect.objectContaining({
            orientation: undefined,
          }),
        }),
      })
    )
  })

  test('should send the right orientation setting to the api', async () => {
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
              right: expect.objectContaining({
                orientation: undefined,
              }),
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
          right: expect.objectContaining({
            orientation: undefined,
          }),
        }),
      })
    )
  })
})
