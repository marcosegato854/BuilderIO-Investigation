import { fireEvent, queries, RenderResult } from '@testing-library/react'
import { Unit } from 'components/dialogs/NewProjectForm/NewProjectForm'
import ScannerTemperatureLegend from 'components/dialogs/ScannerTemperatureLegend/ScannerTemperatureLegend'
import { mergeDeepRight } from 'ramda'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import { t } from 'i18n/config'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('ScannerTemperatureLegend (mockStore) metric', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<ScannerTemperatureLegend />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should close the dialog when closing button is pressed', () => {
    const closeButton = component.getByTestId('close-button')
    fireEvent.click(closeButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'dialogs/CLOSE_DIALOG',
    })
  })

  test('It should show Celsisus temperature when metric unit is selected', () => {
    const { getByTestId } = component
    expect(getByTestId('scanner-temperature-1').textContent).toBe(
      t('notifications.scannerTemperature.infoDialog.banner1.tempC')
    )
    expect(getByTestId('scanner-temperature-2').textContent).toBe(
      t('notifications.scannerTemperature.infoDialog.banner2.tempC')
    )
    expect(getByTestId('scanner-temperature-3').textContent).toBe(
      t('notifications.scannerTemperature.infoDialog.banner3.tempC')
    )
  })
})

describe('ScannerTemperatureLegend (mockStore) imperial', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <ScannerTemperatureLegend unit={Unit.Imperial} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should close the dialog when closing button is pressed', () => {
    const closeButton = component.getByTestId('close-button')
    fireEvent.click(closeButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'dialogs/CLOSE_DIALOG',
    })
  })

  test('It should show Imperial temperature when metric unit is selected', () => {
    const { getByTestId } = component
    expect(getByTestId('scanner-temperature-1').textContent).toBe(
      t('notifications.scannerTemperature.infoDialog.banner1.tempF')
    )
    expect(getByTestId('scanner-temperature-2').textContent).toBe(
      t('notifications.scannerTemperature.infoDialog.banner2.tempF')
    )
    expect(getByTestId('scanner-temperature-3').textContent).toBe(
      t('notifications.scannerTemperature.infoDialog.banner3.tempF')
    )
  })
})
