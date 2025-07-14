import { RenderResult, queries } from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'

import JobProcessingOptions from './JobProcessingOptions'
import {
  JobProcessStatus,
  ProcessingProgressInfo,
} from 'store/features/dataStorage/types'

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

const emptyLayoutOptions: ProcessingProgressInfo = {
  action: null,
  progress: 0,
  currentStatus: JobProcessStatus.NONE,
  isImageAI: false,
}

const emptyOptions: ProcessingOptions = {
  export: {
    las: {
      enable: false,
      done: false,
    },
    lgsx: {
      enable: false,
      done: false,
    },
    e57: {
      enable: false,
      done: false,
    },
  },
  finalise: {
    blur: {
      enable: false,
      done: false,
    },
    colorization: {
      enable: false,
      done: false,
    },
  },
}

describe('JobProcessingOptions', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <JobProcessingOptions
        job={job}
        processingOptions={emptyOptions}
        processingLayout={emptyLayoutOptions}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})
