import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
} from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { AutocaptureNotificationToast } from 'components/atoms/AutocaptureNotificationToast/AutocaptureNotificationToast'
import { AutocaptureNotification } from 'store/features/routing/types'
import { translateAutocaptureNotification } from 'utils/notifications'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

const notification: AutocaptureNotification = {
  id: 1,
  time: '2021-11-24T09:36:01',
  type: 0,
  code: 'STT-002',
  description: 'Automatic stop recording in {p1} seconds',
  p1: '5',
}
const clickCallback = jest.fn()
const buttonLabel = 'click here'

describe('AutocaptureNotificationToast (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <AutocaptureNotificationToast
        notification={notification}
        onClick={clickCallback}
        buttonLabel={buttonLabel}
      />
    )(mockedStore)
  })

  afterEach(() => {})

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display the icon', () => {
    expect(component.getByTestId('autocapture-notification-icon')).toBeTruthy()
  })

  test('It should display the translated description', () => {
    expect(
      component.getByText(
        translateAutocaptureNotification(notification).description
      )
    ).toBeTruthy()
  })

  test('It should display the button if label and callback are provided', () => {
    expect(
      component.getByTestId('autocapture-notification-button')
    ).toBeTruthy()
    expect(component.getByText(buttonLabel)).toBeTruthy()
  })

  test('It should call the callback on button click', () => {
    const button = component.getByTestId('autocapture-notification-button')
    fireEvent.click(button)
    expect(clickCallback).toHaveBeenCalled()
  })
})

describe('AutocaptureNotificationToast (mockStore - no button)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <AutocaptureNotificationToast notification={notification} />
    )(mockedStore)
  })

  afterEach(() => {})

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should not display the button if label and callback are not provided', () => {
    expect(
      screen.queryByTestId('autocapture-notification-button')
    ).not.toBeInTheDocument()
  })
})
