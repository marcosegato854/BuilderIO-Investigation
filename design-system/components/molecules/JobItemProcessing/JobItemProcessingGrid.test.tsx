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

const testJob: IJob = {
  name: 'Job_202211291534',
  planned: false,
  creationdate: '2022-11-29T15:36:27Z',
  updatedate: '2022-11-29T15:36:27Z',
  scans: 1,
  acquired: true,
  hardwareModel: 'PEGASUS TRK700 EVO',
  ntrip: {
    enable: true,
  },
  processOutput: {
    isImageAIdone: false,
    progress: 0,
  },
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

describe('JobItemProcessingGrid (mockStore with currentJob zero processing)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <JobItemProcessing viewMode={GridVariant.GridView} job={testJob} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display the processing box if processing is at 0', () => {
    const componentLayout = component.getByTestId('job-item-processing-grid')
    expect(componentLayout).toBeTruthy()
  })
})

describe('JobItemProcessingGrid (mockStore with currentJob === job)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <JobItemProcessing viewMode={GridVariant.GridView} job={job} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should open the grid layout', () => {
    const componentLayout = component.getByTestId('job-item-processing-grid')
    expect(componentLayout).toBeTruthy()
  })
})

describe('JobItemProcessingGrid (mockStore ready to process)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <JobItemProcessing viewMode={GridVariant.GridView} job={job} />
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

describe('JobItemProcessingGrid (mockStore with job processing error - paused)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <JobItemProcessing viewMode={GridVariant.GridView} job={jobErrorPaused} />
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

describe('JobItemProcessingGrid (mockStore with job processing error - processing)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <JobItemProcessing
        viewMode={GridVariant.GridView}
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

describe('JobItemProcessingGrid (mockStore with job processing error - not processing)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <JobItemProcessing viewMode={GridVariant.GridView} job={jobErrorDone} />
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
