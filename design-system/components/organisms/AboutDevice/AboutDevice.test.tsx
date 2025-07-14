import React from 'react'
import { mockStore } from 'store/mock/mockStoreTests'
import configureMockStore from 'redux-mock-store'
import { queries, RenderResult } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { AboutDevice } from 'components/organisms/AboutDevice/AboutDevice'
import { DeepPartial, mergeDeepRight } from 'ramda'
import { OptimizedRootState as OptimizedSystemState } from 'store/features/system/slice'

describe('LoadCalibration (mockStore)', () => {
  let component: RenderResult<typeof queries>
  const overrideSystemInfo: DeepPartial<OptimizedSystemState> = {
    system: {
      info: { product: 'TRK-PCUTEST', windowsversion: 'WindowsPCUTEST' },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, {
    ...overrideSystemInfo,
  })

  const mockedStore = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch

  beforeEach(() => {
    component = renderWithProvider(<AboutDevice />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display serial number', () => {
    const serialNumber = mergedStore.system.info.serial
    const serialNumberContainer = component.getByTestId('serial-number-about')
    expect(serialNumberContainer).toHaveTextContent(serialNumber)
  })

  test('It should display software version', () => {
    const softwareVersion = mergedStore.system.info.softwareversion
    const softwareVersionContainer = component.getByTestId(
      'software-version-about'
    )
    expect(softwareVersionContainer).toHaveTextContent(softwareVersion)
  })

  // test('It should display software available', () => {
  //   const softwareAvailable = mergedStore.system.info.softwareavailable
  //   const softwareAvailableContainer = component.getByTestId(
  //     'software-available-about'
  //   )
  //   expect(softwareAvailableContainer).toHaveTextContent(softwareAvailable)
  // })

  test('It should display system type', () => {
    const systemType = mergedStore.system.info.systemtype
    const systemTypeContainer = component.getByTestId('system-type-about')
    expect(systemTypeContainer).toHaveTextContent(systemType)
  })

  test('It should display windows version', () => {
    const windowsVersion = mergedStore.system.info.windowsversion
    const windowsVersionContainer = component.getByTestId(
      'windows-version-about'
    )
    expect(windowsVersionContainer).toHaveTextContent(windowsVersion)
  })

  test('It should display product', () => {
    const product = mergedStore.system.info.product
    const productContainer = component.getByTestId('product-about')
    expect(productContainer).toHaveTextContent(product)
  })
})
