import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { queries, RenderResult, waitFor, screen } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { store } from 'store'
import {
  closeAllDialogsAction,
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import { DialogNames } from 'components/dialogs/dialogNames'
import { IAlertProps } from 'components/dialogs/Alert/Alert'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('DialogManager (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<DialogManager />)(store)
    // enable fake timers
    jest.useFakeTimers()
  })

  afterEach(async () => {
    await waitFor(
      () => {
        store.dispatch(closeAllDialogsAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should not display the dialog at first', () => {
    const dialogComponents = screen.queryAllByTestId('dialog-component')
    expect(dialogComponents.length).toBe(0)
  })

  test('It should display the dialog after dispatching an action', async () => {
    await waitFor(
      () => {
        store.dispatch(
          openDialogAction({ component: DialogNames.PlanQualityForm })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const dialogComponent = screen.queryAllByTestId('dialog-component')
    expect(dialogComponent.length).toBe(1)
  })

  test('Dialog should receive props', async () => {
    const testProps: IAlertProps = {
      type: 'error',
      title: 'alert title',
    }
    await waitFor(
      () => {
        store.dispatch(
          openDialogAction({
            component: DialogNames.Alert,
            componentProps: testProps,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const dialogComponents = screen.getAllByTestId('dialog-component')
    expect(dialogComponents.length).toBe(1)
    expect(screen.getByText(testProps.title!)).toBeTruthy()
  })

  test('It should display the remaining dialogs after dispatching an action', async () => {
    await waitFor(
      () => {
        store.dispatch(openDialogAction({ component: DialogNames.JobInfo }))
        store.dispatch(
          openDialogAction({ component: DialogNames.PlanQualityForm })
        )
        store.dispatch(closeDialogAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const dialogComponents = screen.getAllByTestId('dialog-component')
    expect(dialogComponents.length).toBe(1)
  })

  test('It should display the second dialog after dispatching two actions', async () => {
    await waitFor(
      () => {
        store.dispatch(openDialogAction({ component: DialogNames.JobInfo }))
        store.dispatch(
          openDialogAction({ component: DialogNames.PlanQualityForm })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const dialogComponents = screen.getAllByTestId('dialog-component')
    expect(dialogComponents.length).toBe(2)
  })

  test('It should not display a dialog after dispatching a close action', async () => {
    await waitFor(
      () => {
        store.dispatch(openDialogAction({ component: DialogNames.JobInfo }))
        store.dispatch(closeDialogAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const dialogComponents = screen.queryAllByTestId('dialog-component')
    expect(dialogComponents.length).toBe(0)
  })
})
