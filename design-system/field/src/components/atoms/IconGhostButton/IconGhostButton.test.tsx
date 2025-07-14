import { fireEvent, queries, RenderResult } from '@testing-library/react'
import { IconGhostButton } from 'components/atoms/IconGhostButton/IconGhostButton'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

describe('Icon Ghost Button', () => {
  let component: RenderResult<typeof queries>

  const mockOnClick = jest.fn()

  beforeEach(() => {
    component = renderWithProvider(
      <IconGhostButton icon={'Kebab'} onClick={mockOnClick} />
    )(mockedStore)
  })

  afterEach(() => {
    mockOnClick.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should call the callback when clicked', () => {
    const button = component.container.getElementsByTagName('button')[0]
    expect(button).toBeTruthy()
    fireEvent.click(button)
    expect(mockOnClick).toHaveBeenCalled()
  })

  test('it should display an icon', () => {
    const svg = component.container.getElementsByTagName('svg')[0]
    expect(svg).toBeTruthy()
  })
})
