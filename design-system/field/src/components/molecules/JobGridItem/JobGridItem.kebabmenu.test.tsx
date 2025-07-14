/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import { JobGridItem } from 'components/molecules/JobGridItem/JobGridItem'
import { t } from 'i18n/config'
import moxios from 'moxios'
import { DeepPartial, mergeDeepRight } from 'ramda'
import React from 'react'
import { Store } from 'redux'
import configureMockStore from 'redux-mock-store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import {
  mkProcessingStatus,
  mkReportInfo,
  mkReportStart,
  mkStartProcessing,
  mkStopProcessing,
} from 'store/features/dataStorage/mockApi'
import {
  dataStorageConfigActions,
  dataStorageProcessingStatusActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { DataStorageProcessingInfo } from 'store/features/dataStorage/types'
import { resetStoreAction } from 'store/features/global/slice'
import { notificationMessageAction } from 'store/features/system/slice'
import { SystemNotificationType } from 'store/features/system/types'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClientBackend from 'store/services/apiClientBackend'
import { renderWithProvider } from 'utils/test'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

const override: DeepPartial<IJob> = {
  acquired: true,
  processOutput: {
    progress: 51,
    isImageAIdone: false,
  },
}
const jobNotProcessed = mergeDeepRight(
  mockStore.dataStorageService.currentJob!,
  override
) as IJob
const jobImagesProcessed = mergeDeepRight(jobNotProcessed, {
  processOutput: {
    progress: 100,
    isImageAIdone: true,
  },
}) as IJob

describe('JobGridItem kebabmenu (Store) images not processed', () => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  let store: Store
  let mockedProcessingStatusApi: jest.SpyInstance<any>
  let mockedStartProcessingApi: jest.SpyInstance<any>
  let mockedStopProcessingApi: jest.SpyInstance<any>
  let mockedJobReportApi: jest.SpyInstance<any>
  let mockedJobReportInfoApi: jest.SpyInstance<any>

  beforeEach(async () => {
    store = getTestingStore()
    mockedProcessingStatusApi = mkProcessingStatus()
    mockedStartProcessingApi = mkStartProcessing()
    mockedStopProcessingApi = mkStopProcessing()
    mockedJobReportApi = mkReportStart()
    mockedJobReportInfoApi = mkReportInfo()
    // // mock API
    moxios.install(apiClientBackend)
    moxios.stubRequest('/user', {
      status: 200,
      response: {},
    })
    component = renderWithProvider(<JobGridItem job={jobNotProcessed} />)(store)
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
    mockedProcessingStatusApi.mockClear()
    mockedStartProcessingApi.mockClear()
    mockedStopProcessingApi.mockClear()
    mockedJobReportApi.mockClear()
    mockedJobReportInfoApi.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should have the 3 dots button', () => {
    const button = component.getByTestId('dots-button')
    expect(button).toBeTruthy()
  })

  test('It should display the menu', () => {
    const button = component.getByTestId('kebab-menu')
    expect(button).toBeTruthy()
  })

  test('It should call the job report api', async () => {
    const button = component.getByText(
      t('job_browser.kebab.job_report', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(button)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockedJobReportApi).toHaveBeenCalled()
  })

  test('It should keep polling until the acton is done', async () => {
    const button = component.getByText(
      t('job_browser.kebab.job_report', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(button)
      },
      { timeout: 4000 }
    )
    jest.advanceTimersByTime(4000)
    expect(mockedJobReportApi).toHaveBeenCalledTimes(1)
    expect(mockedJobReportInfoApi).toHaveBeenCalledTimes(1)
  })
})

// finalise & export removed in the processing refactoring
/* const jobNotAcquired = mockStore.dataStorageService.currentJob! */

/* describe('JobGridItem kebabmenu (Store) not acquired', () => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  let store: Store

  beforeEach(async () => {
    store = getTestingStore()
    component = renderWithProvider(<JobGridItem job={jobNotAcquired} />)(store)
    // enable fake timers
    jest.useFakeTimers()
  })

  afterEach(async () => {
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should NOT display the processing button', () => {
    const button = screen.queryByText(
      t('job_browser.kebab.finalise_export', 'wrong') as string
    )
    expect(button).not.toBeInTheDocument()
  })
}) */

/* describe('JobGridItem kebabmenu (Store) not processed', () => {
  let component: RenderResult<typeof queries>

  beforeEach(async () => {
    component = renderWithProvider(<JobGridItem job={jobNotProcessed} />)(
      mockedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should call the processing dialog', async () => {
    const button = component.getByText(
      t('job_browser.kebab.finalise_export', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(button)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: {
        ...jobNotProcessed,
      },
      type: 'dataStorageService/OPEN_PROCESSING_DIALOG',
    })
  })
}) */
