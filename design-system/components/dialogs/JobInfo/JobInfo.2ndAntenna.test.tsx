/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import { DialogNames } from 'components/dialogs/dialogNames'
import JobInfo from 'components/dialogs/JobInfo/JobInfo'
import { t } from 'i18n/config'
import { mergeDeepRight } from 'ramda'
import React from 'react'
import { Store } from 'redux'
import configureMockStore from 'redux-mock-store'
import { actionServiceDialogProceed } from 'store/features/actions/slice'
import { mkGetAntennaSettings } from 'store/features/position/mockApi'
import { positionUpdate2ndAntennaSettingsActions } from 'store/features/position/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'

describe('JobInfo (mockStore acquisition DOUBLE antenna)', () => {
  const overrides = {
    router: {
      location: {
        pathname: '/acquisition/p/Project002/Job001',
      },
    },
    dataStorageService: {
      currentJob: {
        antenna: {
          type: 'double',
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
  const mockedStore = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  let mockGetAntennaSettingsAPI: jest.SpyInstance<any>
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    mockGetAntennaSettingsAPI = mkGetAntennaSettings()
    component = renderWithProvider(<JobInfo />)(mockedStore)
  })

  afterEach(() => {
    mockGetAntennaSettingsAPI.mockClear()
    mockDispatch.mockClear()
  })

  test('should display the 2nd antenna field', () => {
    expect(component.getByTestId('2nd-antenna-field')).toBeTruthy()
  })

  test('should display the 2nd antenna values', () => {
    expect(component.getByTestId('2nd-antenna-values')).toBeTruthy()
    const leverarm = mockStore.dataStorageService.currentJob!.antenna!.leverarm!
    expect(component.getByDisplayValue(leverarm.x!.toFixed(3))).toBeTruthy()
    expect(component.getByDisplayValue(leverarm.y!.toFixed(3))).toBeTruthy()
    expect(component.getByDisplayValue(leverarm.z!.toFixed(3))).toBeTruthy()
  })

  test('should open the 2nd antenna configurator when clicking on recalculate', () => {
    const recalculateButton = component.getByTestId('recalculate-button')
    fireEvent.click(recalculateButton)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          component: DialogNames.SecondAntennaConfigurator,
        }),
      })
    )
  })

  // REMOVED: PEF-4040
  /* test('should call an api when clicking the use saved values button', () => {
    const savedvaluesButton = component.getByTestId('savedvalues-button')
    fireEvent.click(savedvaluesButton)
    expect(mockGetAntennaSettingsAPI).toHaveBeenCalled()
  }) */

  test('should NOT display the use saved values button if they not exist', () => {
    const savedvaluesButton = component.queryByTestId('savedvalues-button')
    expect(savedvaluesButton).not.toBeInTheDocument()
  })

  // TODO: [2ND ANTENNA] should be able to connect to the camera socket when displaying the job info dialog (hold, wait for the backend)
  // TODO: [2ND ANTENNA] should display a preview of the saved values in the job info dialog (hold)
  // TODO: [2ND ANTENNA] should NOT display a preview if there are no values saved in the job (hold)
})

describe('JobInfo (mockStore acquisition DOUBLE antenna + saved values)', () => {
  const overrides = {
    router: {
      location: {
        pathname: '/acquisition/p/Project002/Job001',
      },
    },
    dataStorageService: {
      currentJob: {
        antenna: {
          type: 'double',
        },
      },
    },
    authService: {
      userInfo: {
        usertype: 'service',
      },
    },
    positionService: {
      antenna2: {
        enabled: true,
        leverarm: {
          x: 1,
          y: 2,
          z: 0.34,
        },
      },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, overrides)
  const mockedStore = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  let mockGetAntennaSettingsAPI: jest.SpyInstance<any>
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    mockGetAntennaSettingsAPI = mkGetAntennaSettings()
    component = renderWithProvider(<JobInfo />)(mockedStore)
  })

  afterEach(() => {
    mockGetAntennaSettingsAPI.mockClear()
    mockDispatch.mockClear()
  })

  test('should display the use saved values button if they exist', () => {
    const savedvaluesButton = component.getByTestId('savedvalues-button')
    expect(savedvaluesButton).toBeTruthy()
  })
})

describe('JobInfo (mockStore acquisition DOUBLE antenna incomplete)', () => {
  const overrides = {
    router: {
      location: {
        pathname: '/acquisition/p/Project002/Job001',
      },
    },
    dataStorageService: {
      currentJob: {
        antenna: {
          type: 'double',
          leverarm: {
            x: 0,
            y: 0,
            z: 0,
          },
        },
      },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, overrides)
  const mockedStore = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<JobInfo />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('should NOT allow the user to proceed without 2nd antenna information', async () => {
    jest.useFakeTimers()
    const proceedButton = component.getByText(
      t('job_info.confirm', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(proceedButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).not.toHaveBeenCalledWith(actionServiceDialogProceed())
    jest.useRealTimers()
  })
})

describe('JobInfo (mockStore acquisition SINGLE antenna)', () => {
  const overrides = {
    router: {
      location: {
        pathname: '/acquisition/p/Project002/Job001',
      },
      dataStorageService: {
        currentJob: {
          antenna: {
            type: 'single',
          },
        },
      },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, overrides)
  const mockedStore = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<JobInfo />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('should display the 2nd antenna field', () => {
    expect(component.getByTestId('2nd-antenna-field')).toBeTruthy()
  })

  test('should NOT display the 2nd antenna values', () => {
    expect(screen.queryByTestId('2nd-antenna-values')).not.toBeInTheDocument()
  })

  test('should NOT display the 2nd antenna buttons', () => {
    expect(screen.queryByTestId('2nd-antenna-buttons')).not.toBeInTheDocument()
  })

  test('should allow the user to proceed', async () => {
    jest.useFakeTimers()
    const proceedButton = component.getByText(
      t('job_info.confirm', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(proceedButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(actionServiceDialogProceed())
    jest.useRealTimers()
  })
})

describe('JobInfo (mockStore projects)', () => {
  const overrides = {
    router: {
      location: {
        pathname: '/projects/p/Project002',
      },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, overrides)
  const mockedStore = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<JobInfo />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('should NOT display the 2nd antenna buttons', () => {
    expect(screen.queryByTestId('2nd-antenna-buttons')).not.toBeInTheDocument()
  })
})
