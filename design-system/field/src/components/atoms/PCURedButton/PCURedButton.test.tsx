import { fireEvent, queries, RenderResult } from '@testing-library/react'
import { PCURedButton } from 'components/atoms/PCURedButton/PCURedButton'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

describe('PCU Red Button', () => {
  let component: RenderResult<typeof queries>

  const mockOnClick = jest.fn()

  beforeEach(() => {
    component = renderWithProvider(
      <PCURedButton title={'Title'} icon={'Plus'} onClick={mockOnClick} />
    )(mockedStore)
  })

  afterEach(() => {
    mockOnClick.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should call the callback when clicked', () => {
    const fab = component.getByTestId('mainButton')
    expect(fab).toBeTruthy()
    fireEvent.click(fab)
    expect(mockOnClick).toHaveBeenCalled()
  })

  test('It should contain an icon', () => {
    const icon = component.getByTestId('icon')
    expect(icon).toBeTruthy()
  })

  test('It should display title', () => {
    const title = component.getByTestId('title')
    expect(title).toBeTruthy()
    const titleText = title.innerHTML
    expect(titleText).toContain('Title')
  })
})

describe('PCU Red Button acquisition', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <PCURedButton title={'Title'} acquisition={true} />
    )(mockedStore)
  })

  test('It should display blinking dot gif', () => {
    const icon = component.getByTestId('blinking-dot')
    expect(icon).toBeTruthy()
  })
})
