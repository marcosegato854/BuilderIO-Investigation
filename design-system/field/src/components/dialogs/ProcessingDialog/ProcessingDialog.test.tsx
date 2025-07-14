import {
  RenderResult,
  fireEvent,
  queries,
  screen,
  waitFor,
} from '@testing-library/react'
import { t } from 'i18n/config'
import { mergeDeepRight } from 'ramda'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import ProcessingDialog from './ProcessingDialog'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

const job: IJob = {
  name: 'Job001',
  acquired: true,
  scans: 1,
  processOutput: undefined,
  camera: {
    enable: 1,
    frames: 10,
  },
  ntrip: {
    enable: true,
  },
}

const jobNoCamera: IJob = {
  name: 'Job001',
  acquired: true,
  scans: 1,
  camera: {
    enable: 0,
  },
  processOutput: undefined,
}

const jobNoRtk: IJob = {
  name: 'Job001',
  acquired: true,
  scans: 1,
  camera: {
    enable: 1,
    frames: 10,
  },
  ntrip: {
    enable: false,
  },
  processOutput: undefined,
}

const jobNoRtkBlurDone: IJob = {
  name: 'Job001',
  acquired: true,
  scans: 1,
  camera: {
    enable: 1,
    frames: 10,
  },
  ntrip: {
    enable: false,
  },
  processOutput: {
    progress: 100,
    isImageAIdone: true,
    options: {
      finalise: {
        blur: {
          done: true,
          enable: true,
        },
        colorization: {
          done: false,
        },
      },
      export: {
        las: {
          done: false,
        },
        lgsx: {
          done: false,
        },
        e57: {
          done: false,
        },
      },
    },
  },
}

const jobProcessing: IJob = {
  name: 'Job001',
  acquired: true,
  scans: 1,
  camera: {
    enable: 1,
    frames: 10,
  },
  ntrip: {
    enable: true,
  },
  processOutput: undefined,
}

const jobFinalisationDone: IJob = {
  name: 'Job001',
  acquired: true,
  scans: 1,
  camera: {
    enable: 1,
    frames: 10,
  },
  ntrip: {
    enable: true,
  },
  processOutput: {
    progress: 55,
    isImageAIdone: true,
    options: {
      finalise: {
        blur: {
          done: true,
        },
        colorization: {
          done: true,
        },
      },
      export: {
        las: {
          done: false,
        },
        lgsx: {
          done: false,
        },
        e57: {
          done: false,
        },
      },
    },
  },
}

const jobError: IJob = {
  name: 'Job001',
  acquired: true,
  scans: 1,
  camera: {
    enable: 1,
    frames: 10,
  },
  ntrip: {
    enable: true,
  },
  processOutput: {
    errors: [
      {
        code: 'LCB012',
        description: 'processing error',
        type: 2,
      },
    ],
  },
}

const jobExportDone: IJob = {
  name: 'Job001',
  acquired: true,
  scans: 1,
  camera: {
    enable: 1,
    frames: 10,
  },
  ntrip: {
    enable: true,
  },
  processOutput: {
    progress: 100,
    isImageAIdone: true,
    options: {
      finalise: {
        blur: {
          done: true,
        },
        colorization: {
          done: true,
        },
      },
      export: {
        las: {
          done: false,
          enable: false,
        },
        lgsx: {
          done: true,
          enable: true,
        },
        e57: {
          done: false,
          enable: false,
        },
      },
    },
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noProcessingStore: any = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: null,
    },
  })
)

const exportOverlayProcessingStore: any = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: null,
      jobs: [
        mergeDeepRight(mockStore.dataStorageService.jobs[0], {
          processOutput: {
            isImageAIdone: true,
            options: {
              finalise: {
                blur: {
                  done: true,
                },
                colorization: {
                  done: true,
                },
              },
              export: {
                las: {
                  done: false,
                  enable: false,
                },
                lgsx: {
                  done: true,
                  enable: true,
                },
                e57: {
                  done: false,
                  enable: false,
                },
              },
            },
          },
        }),
        mergeDeepRight(mockStore.dataStorageService.jobs[1], {
          processOutput: {
            isImageAIdone: true,
            options: {
              finalise: {
                blur: {
                  done: true,
                },
                colorization: {
                  done: true,
                },
              },
              export: {
                las: {
                  done: true,
                  enable: false,
                },
                lgsx: {
                  done: false,
                  enable: true,
                },
                e57: {
                  done: true,
                  enable: false,
                },
              },
            },
          },
        }),
      ],
    },
  })
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processingExportStore: any = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: [
        {
          disk: 'p',
          project: 'Project002',
          job: 'Job001',
          isImageAI: false,
          progress: 66,
          options: {
            export: {
              lgs: {
                enable: true,
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
                enable: true,
                done: true,
              },
              colorization: {
                enable: true,
                done: true,
              },
            },
          },
        },
      ],
    },
  })
)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch
noProcessingStore.dispatch = mockDispatch
exportOverlayProcessingStore.dispatch = mockDispatch
processingExportStore.dispatch = mockDispatch

describe('ProcessingDialog (mockStore) no Processing', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    jest.useFakeTimers()
    component = renderWithProvider(<ProcessingDialog job={job} />)(
      noProcessingStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should show a start button for starting processing actions', () => {
    const startButton = component.getByTestId('processing-start-button')
    expect(startButton).toBeTruthy()
  })

  test('It should dispatch a start processing if the start button was clicked', async () => {
    const start = component.getByTestId('processing-start-button')
    await waitFor(
      () => {
        fireEvent.click(start)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dataStorageService/START_PROCESSING_REQUEST',
      })
    )
  })

  test('It should dispatch a close dialog if the start button was clicked', async () => {
    const start = component.getByTestId('processing-start-button')
    await waitFor(
      () => {
        fireEvent.click(start)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dialogs/CLOSE_DIALOG',
      })
    )
  })
})

describe('ProcessingDialog (mockStore) no Processing - coordinate system', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    jest.useFakeTimers()
    component = renderWithProvider(<ProcessingDialog job={job} />)(
      noProcessingStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should show a coordinate system locking dialog', async () => {
    const colorizationCheckbox = screen.getByLabelText(
      t('job_processing.options.finalise.colorization', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(colorizationCheckbox)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const start = component.getByTestId('processing-start-button')
    await waitFor(
      () => {
        fireEvent.click(start)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(component.getByTestId('processing-lock')).toBeTruthy()
  })

  test('It should dispatch a start processing action if proceed button is clicked', async () => {
    const colorizationCheckbox = screen.getByLabelText(
      t('job_processing.options.finalise.colorization', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(colorizationCheckbox)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const start = component.getByTestId('processing-start-button')
    await waitFor(
      () => {
        fireEvent.click(start)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const proceed = component.getByTestId('processing-lock-ok')
    await waitFor(
      () => {
        fireEvent.click(proceed)
      },
      { timeout: 500 }
    )
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dataStorageService/START_PROCESSING_REQUEST',
      })
    )
  })
})

describe('ProcessingDialog (mockStore) no Camera', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<ProcessingDialog job={jobNoCamera} />)(
      noProcessingStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should show a disabled blur checkbox if the camera was disabled', () => {
    const blurCheckbox = screen.getByLabelText(
      t('job_processing.options.finalise.blur', 'wrong') as string
    )
    expect(blurCheckbox).toBeTruthy()
    expect(blurCheckbox).toBeDisabled()
  })

  test('It should show a disabled colorization checkbox if the camera was disabled', () => {
    const colorizationCheckbox = screen.getByLabelText(
      t('job_processing.options.finalise.colorization', 'wrong') as string
    )
    expect(colorizationCheckbox).toBeTruthy()
    expect(colorizationCheckbox).toBeDisabled()
  })
})

describe('ProcessingDialog (mockStore) no Rtk', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<ProcessingDialog job={jobNoRtk} />)(
      noProcessingStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should show an enabled blur checkbox if the camera was on', () => {
    const blurCheckbox = screen.getByLabelText(
      t('job_processing.options.finalise.blur', 'wrong') as string
    )
    expect(blurCheckbox).toBeTruthy()
    expect(blurCheckbox).toBeEnabled()
  })

  test('It should show a disabled colorization checkbox', () => {
    const colorizationCheckbox = screen.getByLabelText(
      t('job_processing.options.finalise.colorization', 'wrong') as string
    )
    expect(colorizationCheckbox).toBeTruthy()
    expect(colorizationCheckbox).toBeDisabled()
  })

  test('It should show a disabled export las checkbox', () => {
    const lasCheckbox = screen.getByLabelText(
      t('job_processing.options.export.las', 'wrong') as string
    )
    expect(lasCheckbox).toBeTruthy()
    expect(lasCheckbox).toBeDisabled()
  })

  test('It should show a disabled export lgsx checkbox', () => {
    const lgsxCheckbox = screen.getByLabelText(
      t('job_processing.options.export.lgsx', 'wrong') as string
    )
    expect(lgsxCheckbox).toBeTruthy()
    expect(lgsxCheckbox).toBeDisabled()
  })

  test('It should show a disabled export e57 checkbox', () => {
    const e57Checkbox = screen.getByLabelText(
      t('job_processing.options.export.e57', 'wrong') as string
    )
    expect(e57Checkbox).toBeTruthy()
    expect(e57Checkbox).toBeDisabled()
  })
})

describe('ProcessingDialog (mockStore) no Rtk - blur done', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<ProcessingDialog job={jobNoRtkBlurDone} />)(
      noProcessingStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should show a disabled blur checkbox', () => {
    const blurCheckbox = screen.getByLabelText(
      t('job_processing.options.finalise.blur', 'wrong') as string
    )
    expect(blurCheckbox).toBeTruthy()
    expect(blurCheckbox).toBeDisabled()
  })

  test('It should show a disabled colorization checkbox', () => {
    const colorizationCheckbox = screen.getByLabelText(
      t('job_processing.options.finalise.colorization', 'wrong') as string
    )
    expect(colorizationCheckbox).toBeTruthy()
    expect(colorizationCheckbox).toBeDisabled()
  })

  test('It should show a disabled export las checkbox', () => {
    const lasCheckbox = screen.getByLabelText(
      t('job_processing.options.export.las', 'wrong') as string
    )
    expect(lasCheckbox).toBeTruthy()
    expect(lasCheckbox).toBeDisabled()
  })

  test('It should show a disabled export lgsx checkbox', () => {
    const lgsxCheckbox = screen.getByLabelText(
      t('job_processing.options.export.lgsx', 'wrong') as string
    )
    expect(lgsxCheckbox).toBeTruthy()
    expect(lgsxCheckbox).toBeDisabled()
  })

  test('It should show a disabled export e57 checkbox', () => {
    const e57Checkbox = screen.getByLabelText(
      t('job_processing.options.export.e57', 'wrong') as string
    )
    expect(e57Checkbox).toBeTruthy()
    expect(e57Checkbox).toBeDisabled()
  })

  test('It should show a disabled start processing button', () => {
    const startButton = component.getByTestId('processing-start-button')
    expect(startButton).toBeTruthy()
    expect(startButton).toBeDisabled()
  })
})

// REMOVED PEF-3796
/* describe('ProcessingDialog (mockStore) processing imageAI', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<ProcessingDialog job={jobProcessing} />)(
      mockedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should show read-only blur checkbox', () => {
    const blurCheckbox = screen.getByLabelText(
      t('job_processing.options.finalise.blur', 'wrong') as string
    )
    expect(blurCheckbox).toBeTruthy()
    expect(blurCheckbox).toBeDisabled()
  })

  test('It should show read-only colorization checkbox', () => {
    const colorizationCheckbox = screen.getByLabelText(
      t('job_processing.options.finalise.colorization', 'wrong') as string
    )
    expect(colorizationCheckbox).toBeTruthy()
    expect(colorizationCheckbox).toBeDisabled()
  })

  test('It should show read-only export las checkbox', () => {
    const lasCheckbox = screen.getByLabelText(
      t('job_processing.options.export.las', 'wrong') as string
    )
    expect(lasCheckbox).toBeTruthy()
    expect(lasCheckbox).toBeDisabled()
  })

  test('It should show read-only export lgsx checkbox', () => {
    const lgsxCheckbox = screen.getByLabelText(
      t('job_processing.options.export.lgsx', 'wrong') as string
    )
    expect(lgsxCheckbox).toBeTruthy()
    expect(lgsxCheckbox).toBeDisabled()
  })

  test('It should show read-only export e57 checkbox', () => {
    const e57Checkbox = screen.getByLabelText(
      t('job_processing.options.export.e57', 'wrong') as string
    )
    expect(e57Checkbox).toBeTruthy()
    expect(e57Checkbox).toBeDisabled()
  })

  test('It should show a pause button', () => {
    const pauseButton = component.getByTestId('processing-pause-button')
    expect(pauseButton).toBeTruthy()
  })

  test('It should dispatch a delete processing event if pause button is pressed', () => {
    const pauseButton = component.getByTestId('processing-pause-button')
    expect(pauseButton).toBeTruthy()
    fireEvent.click(pauseButton)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dataStorageService/STOP_PROCESSING_REQUEST',
      })
    )
  })
}) */

describe('ProcessingDialog (mockStore) finalisation done', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    jest.useFakeTimers()
    component = renderWithProvider(
      <ProcessingDialog job={jobFinalisationDone} coordsysIsLocked={true} />
    )(noProcessingStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should show read-only blur checkbox', () => {
    const blurCheckbox = screen.getByLabelText(
      t('job_processing.options.finalise.blur', 'wrong') as string
    )
    expect(blurCheckbox).toBeTruthy()
    expect(blurCheckbox).toBeDisabled()
  })

  test('It should show read-only colorization checkbox', () => {
    const colorizationCheckbox = screen.getByLabelText(
      t('job_processing.options.finalise.colorization', 'wrong') as string
    )
    expect(colorizationCheckbox).toBeTruthy()
    expect(colorizationCheckbox).toBeDisabled()
  })

  test('It should show selectable export las checkbox', () => {
    const lasCheckbox = screen.getByLabelText(
      t('job_processing.options.export.las', 'wrong') as string
    )
    expect(lasCheckbox).toBeTruthy()
    expect(lasCheckbox).toBeEnabled()
  })

  test('It should show selectable export lgsx checkbox', () => {
    const lgsxCheckbox = screen.getByLabelText(
      t('job_processing.options.export.lgsx', 'wrong') as string
    )
    expect(lgsxCheckbox).toBeTruthy()
    expect(lgsxCheckbox).toBeEnabled()
  })

  test('It should show selectable export e57 checkbox', () => {
    const e57Checkbox = screen.getByLabelText(
      t('job_processing.options.export.e57', 'wrong') as string
    )
    expect(e57Checkbox).toBeTruthy()
    expect(e57Checkbox).toBeEnabled()
  })

  test('It should show a disabled start button for starting processing actions', () => {
    const startButton = component.getByTestId('processing-start-button')
    expect(startButton).toBeTruthy()
    expect(startButton).toBeDisabled()
  })

  test('It should show an enabled start button if an export checkbox is selected', async () => {
    const lasCheckbox = screen.getByLabelText(
      t('job_processing.options.export.las', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(lasCheckbox)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const startButton = component.getByTestId('processing-start-button')
    expect(startButton).toBeTruthy()
    expect(startButton).toBeEnabled()
  })

  test('It should dispatch a start processing if the start button was clicked', async () => {
    const lasCheckbox = screen.getByLabelText(
      t('job_processing.options.export.las', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(lasCheckbox)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const startButton = component.getByTestId('processing-start-button')
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dataStorageService/START_PROCESSING_REQUEST',
      })
    )
  })

  test('It should dispatch a close dialog if the start button was clicked', async () => {
    const lasCheckbox = screen.getByLabelText(
      t('job_processing.options.export.las', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(lasCheckbox)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const startButton = component.getByTestId('processing-start-button')
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dialogs/CLOSE_DIALOG',
      })
    )
  })
})

// REMOVED PEF-3796
/* describe('ProcessingDialog (mockStore) processing export', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <ProcessingDialog job={jobFinalisationDone} />
    )(processingExportStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should show read-only blur checkbox', () => {
    const blurCheckbox = screen.getByLabelText(
      t('job_processing.options.finalise.blur', 'wrong') as string
    )
    expect(blurCheckbox).toBeTruthy()
    expect(blurCheckbox).toBeDisabled()
  })

  test('It should show read-only colorization checkbox', () => {
    const colorizationCheckbox = screen.getByLabelText(
      t('job_processing.options.finalise.colorization', 'wrong') as string
    )
    expect(colorizationCheckbox).toBeTruthy()
    expect(colorizationCheckbox).toBeDisabled()
  })

  test('It should show read-only export las checkbox', () => {
    const lasCheckbox = screen.getByLabelText(
      t('job_processing.options.export.las', 'wrong') as string
    )
    expect(lasCheckbox).toBeTruthy()
    expect(lasCheckbox).toBeDisabled()
  })

  test('It should show read-only export lgsx checkbox', () => {
    const lgsxCheckbox = screen.getByLabelText(
      t('job_processing.options.export.lgsx', 'wrong') as string
    )
    expect(lgsxCheckbox).toBeTruthy()
    expect(lgsxCheckbox).toBeDisabled()
  })

  test('It should show read-only export e57 checkbox', () => {
    const e57Checkbox = screen.getByLabelText(
      t('job_processing.options.export.e57', 'wrong') as string
    )
    expect(e57Checkbox).toBeTruthy()
    expect(e57Checkbox).toBeDisabled()
  })

  test('It should show a stop button', () => {
    const stopButton = component.getByTestId('processing-stop-button')
    expect(stopButton).toBeTruthy()
  })

  test('It should dispatch a delete processing event if pause button is pressed', () => {
    const stopButton = component.getByTestId('processing-stop-button')
    expect(stopButton).toBeTruthy()
    fireEvent.click(stopButton)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dataStorageService/STOP_PROCESSING_REQUEST',
      })
    )
  })
}) */

describe('ProcessingDialog (mockStore) processing error', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <ProcessingDialog job={jobError} coordsysIsLocked={true} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should show an error icon', () => {
    const errorIcon = component.getByTestId('error-icon-colorization')
    expect(errorIcon).toBeTruthy()
  })

  test('It should show a start button for starting processing actions', () => {
    const startButton = component.getByTestId('processing-start-button')
    expect(startButton).toBeTruthy()
  })

  test('It should dispatch a start processing if the start button was clicked', async () => {
    const startButton = component.getByTestId('processing-start-button')
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dataStorageService/START_PROCESSING_REQUEST',
      })
    )
  })

  test('It should dispatch a close dialog if the start button was clicked', async () => {
    const startButton = component.getByTestId('processing-start-button')
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dialogs/CLOSE_DIALOG',
      })
    )
  })
})

describe('ProcessingDialog (mockStore) processing export overwrite', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <ProcessingDialog job={jobExportDone} coordsysIsLocked={true} />
    )(exportOverlayProcessingStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    mockDispatch.mockClear()
  })

  test('It should open an overlay screen if an export already exist', async () => {
    const lgsxCheckbox = screen.getByLabelText(
      t('job_processing.options.export.lgsx', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(lgsxCheckbox)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const startButton = component.getByTestId('processing-start-button')
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const overlayDiv = component.getByTestId('processing-overwrite')
    expect(overlayDiv).toBeTruthy()
  })

  test('It should show the name of the export to be overwritten', async () => {
    const lgsxCheckbox = screen.getByLabelText(
      t('job_processing.options.export.lgsx', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(lgsxCheckbox)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const startButton = component.getByTestId('processing-start-button')
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const overlayDiv = component.getByTestId('processing-overwrite')
    expect(overlayDiv).toBeTruthy()
    expect(overlayDiv).toHaveTextContent(/LGSX/)
  })

  test('It should close the overlay screen if cancel button is pressed', async () => {
    const lgsxCheckbox = screen.getByLabelText(
      t('job_processing.options.export.lgsx', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(lgsxCheckbox)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const startButton = component.getByTestId('processing-start-button')
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const overlayDiv = component.getByTestId('processing-overwrite')
    expect(overlayDiv).toBeTruthy()
    const overlayCancel = component.getByTestId('processing-overwrite-cancel')
    fireEvent.click(overlayCancel)
    expect(screen.queryByTestId('processing-overwrite')).not.toBeInTheDocument()
  })

  test('It should dispatch the processing action if ok button is pressed', async () => {
    const lgsxCheckbox = screen.getByLabelText(
      t('job_processing.options.export.lgsx', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(lgsxCheckbox)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const startButton = component.getByTestId('processing-start-button')
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const overlayDiv = component.getByTestId('processing-overwrite')
    expect(overlayDiv).toBeTruthy()
    const overlayOk = component.getByTestId('processing-overwrite-ok')
    await waitFor(
      () => {
        fireEvent.click(overlayOk)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dataStorageService/START_PROCESSING_REQUEST',
      })
    )
  })
})

describe('ProcessingDialog (mockStore) processing export overwrite, project already exported', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <ProcessingDialog job={jobFinalisationDone} coordsysIsLocked={true} />
    )(exportOverlayProcessingStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    mockDispatch.mockClear()
  })

  test('It should open an overlay screen if an E57 export already exist in the project', async () => {
    const e57Checkbox = screen.getByLabelText(
      t('job_processing.options.export.e57', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(e57Checkbox)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const startButton = component.getByTestId('processing-start-button')
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const overlayDiv = component.getByTestId('processing-overwrite')
    expect(overlayDiv).toBeTruthy()
  })

  test('It should open an overlay screen if an LGSX export already exist in the project', async () => {
    const lgsxCheckbox = screen.getByLabelText(
      t('job_processing.options.export.lgsx', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(lgsxCheckbox)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const startButton = component.getByTestId('processing-start-button')
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const overlayDiv = component.getByTestId('processing-overwrite')
    expect(overlayDiv).toBeTruthy()
  })

  test('It should NOT open an overlay screen if a LAS export already exist in the project', async () => {
    const lasCheckbox = screen.getByLabelText(
      t('job_processing.options.export.las', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(lasCheckbox)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const startButton = component.getByTestId('processing-start-button')
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const overlayDiv = screen.queryByText(
      t('job_processing.overwrite_alert.title', 'wrong') as string
    )
    expect(overlayDiv).not.toBeInTheDocument()
  })
})
