/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import SecondAntennaConfigurator from 'components/dialogs/SecondAntennaConfigurator/SecondAntennaConfigurator'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { ErrorManager } from 'components/organisms/ErrorManager/ErrorManager'
import { t } from 'i18n/config'
import { mergeDeepRight } from 'ramda'
import { Store } from 'redux'
import configureMockStore from 'redux-mock-store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import { mkAntennaClientSettings } from 'store/features/camera/mockApi'
import { mkGetAntennaSettings } from 'store/features/position/mockApi'
import { mockStore } from 'store/mock/mockStoreTests'
import { mtToFt } from 'utils/numbers'
import { renderWithProvider } from 'utils/test'
import React from 'react'

const mockedStore = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('SecondAntennaConfigurator (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <div>
        <SecondAntennaConfigurator />
      </div>
    )(mockedStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should display the manual button and the distance in pick mode', () => {
    const button = component.getByText(
      t('second_antenna.manual', 'wrong') as string
    )
    const pickButton = screen.queryByText(
      t('second_antenna.pick', 'wrong') as string
    )
    const distanceField = component.getByTestId('distance-field')
    expect(pickButton).not.toBeInTheDocument()
    expect(button).toBeTruthy()
    expect(distanceField).toBeTruthy()
  })

  test('It should display the pick button and the leverarm fields in manual mode', async () => {
    const manualButton = component.getByText(
      t('second_antenna.manual', 'wrong') as string
    )
    const calculateButton = component.getByText(
      t('second_antenna.calculate', 'wrong') as string
    )
    expect(calculateButton).toBeTruthy()
    await waitFor(
      () => {
        fireEvent.click(manualButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const pickButton = component.getByText(
      t('second_antenna.pick', 'wrong') as string
    )
    const manualButtonAfter = screen.queryByText(
      t('second_antenna.manual', 'wrong') as string
    )
    const calculateButtonAfter = screen.queryByText(
      t('second_antenna.calculate', 'wrong') as string
    )
    expect(calculateButtonAfter).not.toBeInTheDocument()
    expect(manualButtonAfter).not.toBeInTheDocument()
    expect(pickButton).toBeTruthy()
  })

  test('It should display help icon in manual mode', async () => {
    const helpIcon = screen.queryByTestId('help-button')
    expect(helpIcon).not.toBeInTheDocument()
    const manualButton = component.getByText(
      t('second_antenna.manual', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(manualButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const helpIconAfter = component.getByTestId('help-button')
    expect(helpIconAfter).toBeTruthy()
  })
})

const savedLeverArm = {
  x: 2,
  y: 3,
  z: 4,
}
const mockedStoreSavedValues = configureMockStore()(
  mergeDeepRight(mockStore, {
    cameraService: {
      antenna2: {
        pixel: {
          x: 0,
          y: 0,
        },
        distance: 0,
        leverarm: savedLeverArm,
      },
    },
  })
)
describe('SecondAntennaConfigurator (saved values)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <div>
        <SecondAntennaConfigurator />
      </div>
    )(mockedStoreSavedValues)
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should display the pick button and the leverarm at mount', async () => {
    const pickButton = component.getByText(
      t('second_antenna.pick', 'wrong') as string
    )
    expect(pickButton).toBeTruthy()
    const xInput = component.getByTestId('leverarm-x') as HTMLInputElement
    const yInput = component.getByTestId('leverarm-y') as HTMLInputElement
    const zInput = component.getByTestId('leverarm-z') as HTMLInputElement
    expect(Number(xInput.value)).toBe(savedLeverArm.x)
    expect(Number(yInput.value)).toBe(savedLeverArm.y)
    expect(Number(zInput.value)).toBe(savedLeverArm.z)
  })
})

const mockedStoreSavedValuesImperial = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      currentProject: {
        coordinate: {
          unit: 'imperial',
        },
      },
    },
    cameraService: {
      antenna2: {
        pixel: {
          x: 0,
          y: 0,
        },
        distance: 0,
        leverarm: savedLeverArm,
      },
    },
  })
)
describe('SecondAntennaConfigurator (saved values imperial)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <div>
        <SecondAntennaConfigurator />
      </div>
    )(mockedStoreSavedValuesImperial)
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should display the pick button and the leverarm at mount', async () => {
    const pickButton = component.getByText(
      t('second_antenna.pick', 'wrong') as string
    )
    expect(pickButton).toBeTruthy()
    const xInput = component.getByTestId('leverarm-x') as HTMLInputElement
    const yInput = component.getByTestId('leverarm-y') as HTMLInputElement
    const zInput = component.getByTestId('leverarm-z') as HTMLInputElement
    expect(Number(xInput.value)).toBe(mtToFt(savedLeverArm.x))
    expect(Number(yInput.value)).toBe(mtToFt(savedLeverArm.y))
    expect(Number(zInput.value)).toBe(mtToFt(savedLeverArm.z))
  })
})

describe('SecondAntennaConfigurator (testingStore)', () => {
  let component: RenderResult<typeof queries>
  let store: Store
  let mockGetAntennaSettingsAPI: jest.SpyInstance<any>
  let mockGetAntennaClientSettingsAPI: jest.SpyInstance<any>
  const mockOnSave = jest.fn()

  beforeEach(() => {
    store = getTestingStore()
    mockGetAntennaSettingsAPI = mkGetAntennaSettings()
    mockGetAntennaClientSettingsAPI = mkAntennaClientSettings()
    component = renderWithProvider(
      <div>
        <DialogManager />
        <ErrorManager />
        <SecondAntennaConfigurator onSave={mockOnSave} />
      </div>
    )(store)
  })

  afterEach(() => {
    mockGetAntennaSettingsAPI.mockClear()
    mockGetAntennaClientSettingsAPI.mockClear()
    mockOnSave.mockClear()
  })

  test('It should check for manual values before saving', async () => {
    const manualButton = component.getByText(
      t('second_antenna.manual', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(manualButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const saveButton = component.getByText(
      t('second_antenna.save', 'wrong') as string
    )
    const originalConsoleError = console.error
    console.error = jest.fn()
    await waitFor(
      () => {
        fireEvent.click(saveButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const manualValuesAlert = screen.getByText(
      t('job_info.errors.2nd_antenna_invalid', 'wrong') as string
    )
    expect(manualValuesAlert).toBeTruthy()
    // console.error = originalConsoleError
  })

  test('It should NOT accept x: 0, y: 0 as valid input', async () => {
    const manualButton = component.getByText(
      t('second_antenna.manual', 'wrong') as string
    )
    const xInput = component.getByTestId('leverarm-x')
    const yInput = component.getByTestId('leverarm-y')
    const zInput = component.getByTestId('leverarm-z')
    await waitFor(
      () => {
        fireEvent.click(manualButton)
      },
      { timeout: 500 }
    )
    await waitFor(
      () => {
        fireEvent.change(xInput, { target: { value: '0' } })
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        fireEvent.change(yInput, { target: { value: '0' } })
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        fireEvent.change(zInput, { target: { value: '1' } })
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const saveButton = component.getByText(
      t('second_antenna.save', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(saveButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const errorAlert = screen.getByText(
      t('job_info.errors.2nd_antenna_invalid', 'wrong') as string
    )
    expect(errorAlert).toBeTruthy()
  })

  test('It should accept x: 1, y: 0, z: 0 as valid input', async () => {
    const manualButton = component.getByText(
      t('second_antenna.manual', 'wrong') as string
    )
    const xInput = component.getByTestId('leverarm-x')
    const yInput = component.getByTestId('leverarm-y')
    const zInput = component.getByTestId('leverarm-z')
    await waitFor(
      () => {
        fireEvent.click(manualButton)
      },
      { timeout: 500 }
    )
    await waitFor(
      () => {
        fireEvent.change(xInput, { target: { value: '1' } })
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        fireEvent.change(yInput, { target: { value: '0' } })
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        fireEvent.change(zInput, { target: { value: '0' } })
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const saveButton = component.getByText(
      t('second_antenna.save', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(saveButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        server: expect.objectContaining({
          leverarm: {
            x: 1,
            y: 0,
            z: 0,
          },
        }),
        client: expect.objectContaining({
          leverarm: {
            x: 1,
            y: 0,
            z: 0,
          },
        }),
      })
    )
  })

  test('It should send manual values to the API', async () => {
    const manualButton = component.getByText(
      t('second_antenna.manual', 'wrong') as string
    )
    const xInput = component.getByTestId('leverarm-x')
    const yInput = component.getByTestId('leverarm-y')
    const zInput = component.getByTestId('leverarm-z')
    await waitFor(
      () => {
        fireEvent.click(manualButton)
      },
      { timeout: 500 }
    )
    await waitFor(
      () => {
        fireEvent.change(xInput, { target: { value: '1' } })
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        fireEvent.change(yInput, { target: { value: '2' } })
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        fireEvent.change(zInput, { target: { value: '3' } })
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const saveButton = component.getByText(
      t('second_antenna.save', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(saveButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        server: expect.objectContaining({
          leverarm: {
            x: 1,
            y: 2,
            z: 3,
          },
        }),
        client: expect.objectContaining({
          leverarm: {
            x: 1,
            y: 2,
            z: 3,
          },
        }),
      })
    )
  })
})
