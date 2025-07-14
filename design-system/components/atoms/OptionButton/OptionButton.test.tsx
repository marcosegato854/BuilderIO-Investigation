import {
  fireEvent,
  getByText,
  queries,
  render,
  RenderResult,
  waitFor,
} from '@testing-library/react'
import { OptionButton } from 'components/atoms/OptionButton/OptionButton'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

describe('Basic Option Button', () => {
  let component: RenderResult<typeof queries>

  const mockOnClick = jest.fn()

  beforeEach(() => {
    component = renderWithProvider(
      <OptionButton title={'Option Title'} onClick={mockOnClick} />
    )(mockedStore)
  })

  afterEach(() => {
    mockOnClick.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should show title', () => {
    const rightContent = component.getByTestId('option-left-content')
    expect(rightContent).toBeTruthy()
    const innerContent = rightContent.innerHTML
    expect(innerContent).toContain('Option Title')
  })

  test('It should call the callback when clicked', () => {
    const buttonContainer =
      component.container.getElementsByTagName('button')[0]
    expect(buttonContainer).toBeTruthy()
    fireEvent.click(buttonContainer)
    expect(mockOnClick).toHaveBeenCalled()
  })
})

describe('Option Button with caption', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <OptionButton
        title={'Option Title'}
        caption={'Option Caption'}
        captionHighlighted={true}
      />
    )(mockedStore)
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should show caption', () => {
    const rightContent = component.getByTestId('option-left-content')
    expect(rightContent).toBeTruthy()
    const innerContent = rightContent.innerHTML
    expect(innerContent).toContain('Option Caption')
  })
})

describe('Option Button with switch', () => {
  let component: RenderResult<typeof queries>

  const mockOnChange = jest.fn()

  beforeEach(() => {
    component = renderWithProvider(
      <OptionButton
        title={'Option Title'}
        caption={'Option Caption'}
        captionHighlighted={true}
        showSwitch={true}
        onSwitchChange={mockOnChange}
      />
    )(mockedStore)
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should change status when toggle clicked', async () => {
    const optionSwitch =
      component.container.getElementsByClassName('MuiSwitch-root')[0]
    expect(optionSwitch).toBeTruthy()
    await waitFor(
      () => {
        fireEvent.click(optionSwitch.querySelectorAll('input')[0])
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockOnChange).toHaveBeenCalled()
  })
})
