import React from 'react'
import { renderWithProvider } from 'utils/test'
import { mockStore } from 'store/mock/mockStoreTests'
import configureMockStore from 'redux-mock-store'
import {
  screen,
  fireEvent,
  RenderResult,
  queries,
} from '@testing-library/react'
import { FinalAlignmentButton } from './FinalAlignmentButton'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

const mockClick = jest.fn()
const mockClickSecondary = jest.fn()

describe('FinalAlignmentButton', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <FinalAlignmentButton
        onClick={mockClick}
        onClickSecondary={mockClickSecondary}
        label="Start alignment"
        labelSecondary="Force deactivate"
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
    mockClick.mockClear()
    mockClickSecondary.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('it should display "Force deactivate" only when clicking on the arrow', () => {
    const arrow = component.getByTestId('arrow-icon')
    expect(screen.queryByText('Force deactivate')).toBeNull()
    expect(arrow).toBeTruthy()
    fireEvent.click(arrow)
    expect(component.getByText('Force deactivate')).toBeTruthy()
  })

  test('it should call the callback when clicking the main button', () => {
    const mainButton = component.getByText('Start alignment')
    expect(mainButton).toBeTruthy()
    fireEvent.click(mainButton)
    expect(mockClick).toHaveBeenCalled()
  })

  test('it should call the callback when clicking on the secondary button', () => {
    const arrow = component.getByTestId('arrow-icon')
    expect(screen.queryByText('Force deactivate')).toBeNull()
    expect(arrow).toBeTruthy()
    fireEvent.click(arrow)
    const secondaryButton = component.getByText('Force deactivate')
    fireEvent.click(secondaryButton)
    expect(mockClickSecondary).toHaveBeenCalled()
  })

  test('should show the icon only if activated by props', () => {
    component = renderWithProvider(
      <FinalAlignmentButton
        onClick={mockClick}
        onClickSecondary={mockClickSecondary}
        label="Start alignment"
        labelSecondary="Force deactivate"
        icon="PowerButton"
      />
    )(mockedStore)
    expect(component.getByTestId('icon')).toBeTruthy()
  })

  test('should show the icon only if activated by props', () => {
    component = renderWithProvider(
      <FinalAlignmentButton
        onClick={mockClick}
        onClickSecondary={mockClickSecondary}
        label="Start alignment"
        labelSecondary="Force deactivate"
      />
    )(mockedStore)
    const found = screen.queryByTestId('icon')
    expect(found).not.toBeInTheDocument()
    component = renderWithProvider(
      <FinalAlignmentButton
        onClick={mockClick}
        onClickSecondary={mockClickSecondary}
        label="Start alignment"
        labelSecondary="Force deactivate"
        icon="PowerButton"
      />
    )(mockedStore)
    expect(component.getByTestId('icon')).toBeTruthy()
  })
})
