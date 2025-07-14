import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
} from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { JobItemProcessing } from 'components/molecules/JobItemProcessing/JobItemProcessing'
import { GridVariant } from 'components/molecules/CardsGrid/CardsGrid'
import { t } from 'i18n/config'
import { mergeDeepRight } from 'ramda'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

const job: IJob = {
  name: 'Job001',
  acquired: true,
  scans: 1,
}

const jobErrorProcessing: IJob = {
  name: 'Job001',
  acquired: true,
  scans: 1,
  processOutput: {
    progress: 33,
    errors: [
      {
        code: 'LCB010',
        description: 'this is a fancy error',
        type: 2, // 1=warning, 2=error
      },
    ],
  },
}

const jobErrorPaused: IJob = {
  name: 'Job002',
  acquired: true,
  scans: 1,
  processOutput: {
    progress: 33,
    errors: [
      {
        code: 'LCB010',
        description: 'this is a fancy error',
        type: 2, // 1=warning, 2=error
      },
    ],
  },
}

const jobErrorDone: IJob = {
  name: 'Job002',
  acquired: true,
  scans: 1,
  processOutput: {
    progress: 100,
    errors: [
      {
        code: 'LCB010',
        description: 'this is a fancy error',
        type: 2, // 1=warning, 2=error
      },
    ],
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStoreNotProcessing: any = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: null,
    },
  })
)

mockedStoreNotProcessing.dispatch = mockDispatch

describe('JobItemProcessingList (mockStore with currentJob === job)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <JobItemProcessing viewMode={GridVariant.ListView} job={job} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should open the list layout', () => {
    const componentLayout = component.getByTestId('job-item-processing-list')
    expect(componentLayout).toBeTruthy()
  })
})

describe('JobItemProcessingList (mockStore ready to process)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <JobItemProcessing viewMode={GridVariant.ListView} job={job} />
    )(mockedStoreNotProcessing)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should dispatch an action when clicking on the processing icon', () => {
    const processingIcon = component.getByTestId('job-processing-icon')
    fireEvent.click(processingIcon)
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: {
        job,
        disk: mockStore.dataStorageService.currentProject.disk,
        projectName: mockStore.dataStorageService.currentProject.name,
      },
      type: 'dataStorageService/OPEN_PROCESSING_DIALOG',
    })
  })
})

describe('JobItemProcessingList (mockStore with job processing error - paused)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <JobItemProcessing viewMode={GridVariant.ListView} job={jobErrorPaused} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should NOT show the error screen if a process error is present (grid view)', () => {
    expect(
      screen.queryByText(t('job_processing.status.error', 'wrong') as string)
    ).not.toBeInTheDocument()
  })
})

describe('JobItemProcessingList (mockStore with job processing error - processing)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <JobItemProcessing
        viewMode={GridVariant.ListView}
        job={jobErrorProcessing}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should NOT show the error screen if a process error is present (grid view)', () => {
    expect(
      screen.queryByText(t('job_processing.status.error', 'wrong') as string)
    ).not.toBeInTheDocument()
  })
})

describe('JobItemProcessingList (mockStore with job processing error - not processing)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <JobItemProcessing viewMode={GridVariant.ListView} job={jobErrorDone} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should show the error screen if a process error is present (grid view)', () => {
    const errorLabel = component.getByText(
      t('job_processing.status.error', 'wrong') as string
    )
    expect(errorLabel).toBeTruthy()
  })
})
