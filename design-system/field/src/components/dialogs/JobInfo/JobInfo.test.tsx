import {
  RenderResult,
  fireEvent,
  queries,
  screen,
  within,
} from '@testing-library/react'
import JobInfo from 'components/dialogs/JobInfo/JobInfo'
import { cameraEnableOptions } from 'components/dialogs/NewJobForm/options'
import { push } from 'connected-react-router'
import { t } from 'i18n/config'
import { identity, mergeDeepRight } from 'ramda'
import configureMockStore from 'redux-mock-store'
import { actionsServiceAbort } from 'store/features/actions/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import { labelWithUnit } from 'utils/numbers'
import { renderWithProvider } from 'utils/test'

describe('JobInfo (mockStore projects)', () => {
  const overrides = {
    router: {
      location: {
        pathname: '/projects/p/Project002',
      },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, overrides)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    mockedStore.dispatch(push('/p/'))
    component = renderWithProvider(<JobInfo />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('should NOT display the back to jobs button', () => {
    expect(screen.queryByTestId('back-to-jobs')).not.toBeInTheDocument()
  })

  test('should NOT display the collection mode row', () => {
    expect(
      screen.queryByText(
        t('job_info.rows.collectionmode.title', 'wrong') as string
      )
    ).not.toBeInTheDocument()
  })
})

describe('JobInfo (mockStore acquisition)', () => {
  const overrides = {
    router: {
      location: {
        pathname: '/acquisition/p/Project002/Job001',
      },
    },
    dataStorageService: {
      currentJob: {
        ntrip: {
          enable: false,
        },
        camera: {
          enable: 1,
          distance: 2,
        },
      },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, overrides)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    mockedStore.dispatch(push('/p/'))
    component = renderWithProvider(<JobInfo />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should display the image blur setting', () => {
    const cameraBlur = component.getByTestId('camera-blur')
    expect(cameraBlur).toBeTruthy()
    const blurValue = within(cameraBlur).getByText(
      t('job_info.rows.camera.values.yes', 'wrong') as string
    )
    expect(blurValue).toBeTruthy()
  })

  test('should display the camera enable setting', () => {
    const cameraEnable = component.getByTestId('camera-enable')
    expect(cameraEnable).toBeTruthy()
    const cameraEmableValue =
      mockStore.dataStorageService.currentJob.camera.enable
    const enableValue = within(cameraEnable).getByText(
      cameraEnableOptions()
        .find((o) => o.value === cameraEmableValue || 0)
        ?.label.toUpperCase() as string,
      { exact: false }
    )
    expect(enableValue).toBeTruthy()
  })

  test('should display the right camera enable description', () => {
    const cameraEnable = component.getByTestId('camera-enable')
    const cameraSettings = overrides.dataStorageService.currentJob.camera
    const expectedText = `${t(
      'new_job_form.option.camera.on',
      'false'
    ).toUpperCase()}: ${cameraSettings.distance} m`
    expect(within(cameraEnable).getByText(expectedText)).toBeTruthy()
  })

  test('should NOT display the camera distance setting', () => {
    const cameraDistance = screen.queryByTestId('camera-distance')
    expect(cameraDistance).not.toBeInTheDocument()
  })

  test('should NOT display the camera elapse setting', () => {
    const cameraElapse = component.queryByTestId('camera-elapse')
    expect(cameraElapse).not.toBeInTheDocument()
  })

  test('should NOT display tolerance with RTK off', () => {
    const tolerance = screen.queryByText(
      t('job_info.rows.position.accuracy.title', 'Accuracy') as string
    )
    expect(tolerance).not.toBeInTheDocument()
  })

  test('should display the back to jobs button', () => {
    const backButton = component.getByTestId('back-to-jobs')
    expect(backButton).toBeTruthy()
    fireEvent.click(backButton)
    expect(mockDispatch).toHaveBeenCalledWith(actionsServiceAbort())
  })
})

describe('JobInfo (mockStore admin time camera)', () => {
  const overrides = {
    router: {
      location: {
        pathname: '/acquisition/p/Project002/Job001',
      },
    },
    dataStorageService: {
      currentJob: {
        ntrip: {
          enable: false,
        },
        camera: {
          enable: 2,
          elapse: 250,
        },
      },
    },
    authService: {
      userInfo: {
        usertype: 'service',
      },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, overrides)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    mockedStore.dispatch(push('/p/'))
    component = renderWithProvider(<JobInfo />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should display the image blur setting', () => {
    const cameraBlur = component.getByTestId('camera-blur')
    expect(cameraBlur).toBeTruthy()
    const blurValue = within(cameraBlur).getByText(
      t('job_info.rows.camera.values.yes', 'wrong') as string
    )
    expect(blurValue).toBeTruthy()
  })

  test('should display the right camera enable description', () => {
    const cameraEnable = component.getByTestId('camera-enable')
    const cameraSettings = overrides.dataStorageService.currentJob.camera
    const expectedText = `${t(
      'new_job_form.option.camera.on',
      'false'
    ).toUpperCase()}: ${cameraSettings.elapse} ms`
    expect(within(cameraEnable).getByText(expectedText)).toBeTruthy()
  })

  test('should display the camera elapse setting', () => {
    const cameraElapse = component.getByTestId('camera-elapse')
    expect(cameraElapse).toBeTruthy()
  })

  test('should display the camera elapse value', () => {
    const cameraElapse = component.getByTestId('camera-elapse')
    const { unit } = mockStore.dataStorageService.currentProject.coordinate
    expect(
      within(cameraElapse).getByText(
        labelWithUnit(
          'MS',
          identity,
          overrides.dataStorageService.currentJob?.camera?.elapse,
          unit
        )
      )
    )
  })

  test('should NOT display the camera distance setting', () => {
    const cameraDistance = component.queryByTestId('camera-distance')
    expect(cameraDistance).not.toBeInTheDocument()
  })
})

describe('JobInfo (mockStore admin camera off)', () => {
  const overrides = {
    router: {
      location: {
        pathname: '/acquisition/p/Project002/Job001',
      },
    },
    dataStorageService: {
      currentJob: {
        ntrip: {
          enable: false,
        },
        camera: {
          enable: 0,
        },
      },
    },
    authService: {
      userInfo: {
        usertype: 'service',
      },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, overrides)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    mockedStore.dispatch(push('/p/'))
    component = renderWithProvider(<JobInfo />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should display the right camera enable description', () => {
    const cameraEnable = component.getByTestId('camera-enable')
    expect(
      within(cameraEnable).getByText(
        t('new_job_form.option.camera.off', 'false').toUpperCase()
      )
    ).toBeTruthy()
  })

  test('should hide the camera blur description', () => {
    expect(screen.queryByTestId('camera-blur')).not.toBeInTheDocument()
  })

  test('should hide the camera left description', () => {
    expect(screen.queryByTestId('camera-left')).not.toBeInTheDocument()
  })

  test('should hide the camera right description', () => {
    expect(screen.queryByTestId('camera-right')).not.toBeInTheDocument()
  })
})

describe('JobInfo (mockStore TRK100)', () => {
  const overrides = {
    system: {
      info: {
        product: 'PEGASUS TRK100',
      },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, overrides)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    mockedStore.dispatch(push('/p/'))
    component = renderWithProvider(<JobInfo />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('should hide the scanline spacing', () => {
    const scanLineTranslation = t(
      'job_info.rows.scanner.scanlinespacing.title',
      'wrong'
    )
    expect(scanLineTranslation).not.toEqual('wrong')
    expect(screen.queryByText(scanLineTranslation)).not.toBeInTheDocument()
  })
})

describe('JobInfo (mockStore TRK300)', () => {
  const overrides = {
    system: {
      info: {
        product: 'PEGASUS TRK300',
      },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, overrides)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    mockedStore.dispatch(push('/p/'))
    component = renderWithProvider(<JobInfo />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('should hide the scanline spacing', () => {
    const scanLineTranslation = t(
      'job_info.rows.scanner.scanlinespacing.title',
      'wrong'
    )
    expect(scanLineTranslation).not.toEqual('wrong')
    expect(screen.queryByText(scanLineTranslation)).not.toBeInTheDocument()
  })
})
