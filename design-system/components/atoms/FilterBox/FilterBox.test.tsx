import {
  fireEvent,
  queries,
  RenderResult,
  screen,
} from '@testing-library/react'
import { FilterBox } from 'components/atoms/FilterBox/FilterBox'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

const onChange = jest.fn()
const defaultOptions: IClickableOption[] = [
  {
    label: 'First',
    value: 1,
  },
  {
    label: 'Second',
    value: 2,
  },
]

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('FilterBox (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <FilterBox options={defaultOptions} onChange={onChange} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display dropdown when clicked', () => {
    const button = component.getByTestId('open-button')
    expect(button).toBeTruthy()
    fireEvent.click(button)
    const openedDropdown = screen.getAllByTestId('option-list-element')
    expect(openedDropdown.length).toBe(defaultOptions.length)
  })

  test('It should call the onChange attribute of an option with the value provided', () => {
    const button = component.getByTestId('open-button')
    expect(button).toBeTruthy()
    fireEvent.click(button)
    /* const options = component.find('li') */
    const options = screen.getAllByTestId('option-list-element')
    expect(options.length).toBe(defaultOptions.length)
    const option = options[0]
    fireEvent.click(option, {
      target: {
        getAttribute: () => '0',
      },
    })
    expect(onChange.mock.calls[0][0]).toEqual(0)
    expect(onChange.mock.calls[0][1]).toEqual(defaultOptions[0])
  })
})
