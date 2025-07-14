import React from 'react'
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import { Store } from 'redux'
import {
  SystemNotification,
  SystemNotificationType,
} from 'store/features/system/types'
import { AcquisitionNotifications } from 'components/molecules/AcquisitionNotifications/AcquisitionNotifications'
import { notificationMessageAction } from 'store/features/system/slice'
import { t } from 'i18n/config'
import { resetStoreAction } from 'store/features/global/slice'
import { not } from 'mathjs'

const errorNotification: SystemNotification = {
  id: 0,
  type: SystemNotificationType.ERROR,
  description: t('backend_errors.code.ACTSYS-019', 'wrong'),
  code: 'ACTSYS-019',
}

const warningNotification: SystemNotification = {
  id: 0,
  type: SystemNotificationType.WARNING,
  description: t('backend_errors.code.ACTSYS-020', 'wrong'),
  code: 'ACTSYS-020',
}

describe('AcquisitionNotifications (store)', () => {
  let component: RenderResult<typeof queries>
  let store: Store

  beforeEach(() => {
    store = getTestingStore()
    component = renderWithProvider(<AcquisitionNotifications />)(store)
    jest.useFakeTimers()
  })

  afterEach(async () => {
    await waitFor(
      () => {
        store.dispatch(resetStoreAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display errors at center', async () => {
    await waitFor(
      () => {
        store.dispatch(notificationMessageAction(errorNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const centerNotification = screen.getByTestId('center-slide')
    expect(
      within(centerNotification).getByText(errorNotification.description)
    ).toBeTruthy()
  })

  test('It should not display errors at bottom by default', async () => {
    await waitFor(
      () => {
        store.dispatch(notificationMessageAction(errorNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const bottomNotificationsContainer = screen.queryByTestId(
      'bottom-notifications'
    )
    expect(bottomNotificationsContainer).not.toBeInTheDocument()
  })

  test('It should not display warnings at center', async () => {
    await waitFor(
      () => {
        store.dispatch(notificationMessageAction(warningNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const centerNotification = screen.queryByTestId('center-slide')
    expect(centerNotification).not.toBeInTheDocument()
  })

  test('It should display warnings at the bottom by default', async () => {
    await waitFor(
      () => {
        store.dispatch(notificationMessageAction(warningNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const bottomNotificationsContainer = screen.queryByTestId(
      'bottom-notifications'
    )
    expect(bottomNotificationsContainer).toBeTruthy()
    expect(
      within(bottomNotificationsContainer!).getAllByText(
        warningNotification.description
      ).length
    ).toBeTruthy()
  })

  test('It should move errors to the bottom when clicking ok', async () => {
    await waitFor(
      () => {
        store.dispatch(notificationMessageAction(errorNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const centerNotification = screen.getByTestId('center-slide')
    expect(
      within(centerNotification).getByText(errorNotification.description)
      // within(centerNotification).getByText('b')
    ).toBeTruthy()
    // click ok
    const okButton = screen.getByTestId('acquisition-dialog-ok')
    await waitFor(
      () => {
        fireEvent.click(okButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // check that is on the bottom
    const bottomNotificationsContainer = screen.queryByTestId(
      'bottom-notifications'
    )
    expect(bottomNotificationsContainer).toBeTruthy()
    expect(
      within(bottomNotificationsContainer!).getAllByText(
        // 'a'
        errorNotification.description
      ).length
    ).toBeTruthy()
    // check that is not at center
    expect(screen.queryByTestId('center-slide')).not.toBeInTheDocument()
  })

  test('It should move errors to the bottom when clicking ok (multiple)', async () => {
    await waitFor(
      () => {
        store.dispatch(notificationMessageAction(errorNotification))
        store.dispatch(notificationMessageAction(errorNotification))
        store.dispatch(notificationMessageAction(errorNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const centerNotification = screen.getByTestId('center-slide')
    expect(
      within(centerNotification).getByText(errorNotification.description)
    ).toBeTruthy()
    // click ok
    const okButton = screen.getByTestId('acquisition-dialog-ok')
    await waitFor(
      () => {
        fireEvent.click(okButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // check that is on the bottom
    const bottomNotificationsContainer = screen.queryByTestId(
      'bottom-notifications'
    )
    expect(bottomNotificationsContainer).toBeTruthy()
    expect(
      within(bottomNotificationsContainer!).getAllByText(
        // 'a'
        errorNotification.description
      ).length
    ).toBeTruthy()
    // check that is not at center
    expect(screen.queryByTestId('center-slide')).not.toBeInTheDocument()
  })
})
