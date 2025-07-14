import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { fireEvent, queries, RenderResult } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { QualityFeedback } from './QualityFeedback'

type TestElement = Document | Element | Window | Node

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

const mockChange = jest.fn()

describe('QualityFeedback (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <QualityFeedback
        unit="cm"
        value={[5, 15]}
        min={1}
        max={20}
        onChangeCommitted={mockChange}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockChange.mockClear()
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  // TODO comment for working with MUI 5
  /* test('should have an input for min value', () => {
    expect(component.getByTestId('min-input')).toBeTruthy()
  })

  test('should have an input for max value', () => {
    expect(component.getByTestId('max-input')).toBeTruthy()
  })

  test('display the unit', () => {
    expect(component.getByText('cm')).toBeTruthy()
  })

  test('should accept only integers', () => {
    const maxInput = component.getByTestId('max-input')
    const minInput = component.getByTestId('min-input')
    expect(maxInput).toBeTruthy()
    fireEvent.blur(maxInput, { target: { value: '12.3' } })
    expect(mockChange).toBeCalledWith([5, 12])
    fireEvent.change(minInput, { target: { value: '2.8' } })
    expect(mockChange).toBeCalledWith([3, 12])
  })

  test('should update output value as an array of numbers', () => {
    const minInput = component.getByTestId('min-input')
    expect(minInput).toBeTruthy()
    fireEvent.change(minInput, { target: { value: '12.3' } })
    expect(mockChange).toBeCalledWith([12, 15])
  })

  test('max value should always be greater than min value', () => {
    const minInput = component.getByTestId('min-input')
    expect(minInput).toBeTruthy()
    fireEvent.change(minInput, { target: { value: '16' } })
    expect(mockChange).toBeCalledWith([16, 17])
  })

  test('max value should always be greater than min value', () => {
    const minInput = component.getByTestId('min-input')
    expect(minInput).toBeTruthy()
    fireEvent.change(minInput, { target: { value: '-2' } })
    expect(mockChange).toBeCalledWith([1, 15])
  })

  test('min value should have a lower limit', () => {
    const minInput = component.getByTestId('min-input')
    expect(minInput).toBeTruthy()
    fireEvent.change(minInput, { target: { value: '-2' } })
    expect(mockChange).toBeCalledWith([1, 15])
  })

  test('min value should have a higher limit', () => {
    const minInput = component.getByTestId('min-input')
    expect(minInput).toBeTruthy()
    fireEvent.change(minInput, { target: { value: '21' } })
    expect(mockChange).toBeCalledWith([19, 20])
  })

  test('max value should have a higher limit', () => {
    const maxInput = component.getByTestId('max-input')
    expect(maxInput).toBeTruthy()
    fireEvent.blur(maxInput, { target: { value: '150' } })
    expect(mockChange).toBeCalledWith([5, 20])
  })

  test('should round not integer inputs', () => {
    component.unmount()
    component = renderWithProvider(
      <QualityFeedback
        unit="cm"
        value={[5.05, 15.95]}
        min={1}
        max={20}
        onChangeCommitted={mockChange}
      />
    )(mockedStore)
    const minInput: HTMLInputElement = component.getByTestId(
      'min-input'
    ) as HTMLInputElement
    const maxInput: HTMLInputElement = component.getByTestId(
      'max-input'
    ) as HTMLInputElement
    expect(minInput.value).toBe('5')
    expect(maxInput.value).toBe('16')
  }) */
})
