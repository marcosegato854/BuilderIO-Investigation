import { queries, RenderResult } from '@testing-library/react'
import { t } from 'i18n/config'
import { mergeDeepRight } from 'ramda'
import configureMockStore from 'redux-mock-store'
import { TemperatureStatus } from 'store/features/scanner/types'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import { ScannerTemperature } from './ScannerTemperature'
import { getType } from 'typesafe-actions'
import { openDialogAction } from 'store/features/dialogs/slice'

const mockDispatch = jest.fn()
const mockedStore = configureMockStore()(mockStore)

const normalStore = mergeDeepRight(mockStore, {
  scanner: {
    info: [
      {
        position: 'Left',
        temperature: {
          value: 25,
          state: TemperatureStatus.Normal,
        },
      },
      {
        position: 'Right',
        temperature: {
          value: 25,
          state: TemperatureStatus.Normal,
        },
      },
    ],
  },
})
const hesaiScannerNormalStore = configureMockStore()(normalStore)
hesaiScannerNormalStore.dispatch = mockDispatch

const leftStore = mergeDeepRight(mockStore, {
  scanner: {
    info: [
      {
        position: 'Left',
        temperature: {
          value: 25,
          state: TemperatureStatus.Normal,
        },
      },
    ],
  },
})
const hesaiScannerLeftStore = configureMockStore()(leftStore)

const rightStore = mergeDeepRight(mockStore, {
  scanner: {
    info: [
      {
        position: 'Right',
        temperature: {
          value: 25,
          state: TemperatureStatus.Normal,
        },
      },
    ],
  },
})
const hesaiScannerRightStore = configureMockStore()(rightStore)

describe('ScannerTemperature - Left and Right present', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(<ScannerTemperature />)(
      hesaiScannerNormalStore
    )
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should render left and right scanner temperatures', () => {
    const { getByText } = component

    expect(
      getByText(
        t('notifications.scannerTemperature.leftScanner', 'wrong') as string
      )
    ).toBeInTheDocument()
    expect(
      getByText(
        t('notifications.scannerTemperature.rightScanner', 'wrong') as string
      )
    ).toBeInTheDocument()
  })

  test('It should open the legend dialog when clicked', () => {
    const { getByTestId, getByText } = component
    const scannerTemperature = getByTestId('scanner-temperature')
    expect(scannerTemperature).toBeInTheDocument()
    scannerTemperature.click()
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: getType(openDialogAction) })
    )
  })
})

describe('ScannerTemperature - Left and Right absent', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(<ScannerTemperature />)(mockedStore)
  })

  test('It should not render any scanner temperature if no scanner info is available', () => {
    const { queryByText, queryByTestId } = component
    expect(
      queryByText(
        t('notifications.scannerTemperature.leftScanner', 'wrong') as string
      )
    ).toBeNull()
    expect(
      queryByText(
        t('notifications.scannerTemperature.rightScanner', 'wrong') as string
      )
    ).toBeNull()
    expect(queryByTestId('scanner-temperature')).toBeNull()
  })
})

describe('ScannerTemperature - Left only present', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(<ScannerTemperature />)(
      hesaiScannerLeftStore
    )
  })

  test('It should render only left scanner temperature', () => {
    const { getByText, queryByText } = component

    expect(
      getByText(
        t('notifications.scannerTemperature.leftScanner', 'wrong') as string
      )
    ).toBeInTheDocument()
    expect(
      queryByText(
        t('notifications.scannerTemperature.rightScanner', 'wrong') as string
      )
    ).toBeNull()
  })
})

describe('ScannerTemperature - Right only present', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(<ScannerTemperature />)(
      hesaiScannerRightStore
    )
  })

  test('It should render only left scanner temperature', () => {
    const { getByText, queryByText } = component
    expect(
      getByText(
        t('notifications.scannerTemperature.rightScanner', 'wrong') as string
      )
    ).toBeInTheDocument()
    expect(
      queryByText(
        t('notifications.scannerTemperature.leftScanner', 'wrong') as string
      )
    ).toBeNull()
  })
})
