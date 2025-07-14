import {
  fireEvent,
  queries,
  RenderResult,
  screen,
} from '@testing-library/react'
import UpdateDialog from 'components/dialogs/UpdateDialog/UpdateDialog'
import { t } from 'i18n/config'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('UpdateDialog (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<UpdateDialog />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})

describe('UpdateDialog (mockStore) - BEFORE accepting agreement', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<UpdateDialog />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })
  test('It should show the first title "1"', () => {
    const title = component.getByTestId('update-title')
    expect(title).toBeTruthy()
    expect(
      screen.getByText(t('firmwareUpdate.dialog.title1', 'wrong') as string)
    ).toBeTruthy()
  })

  test('It should show the first headline "1"', () => {
    const headline = component.getByTestId('update-headline')
    expect(headline).toBeTruthy()
    expect(
      screen.getByText(t('firmwareUpdate.dialog.headline1', 'wrong') as string)
    ).toBeTruthy()
  })

  test('It should show the EULA', () => {
    const eula = component.getByTestId('update-eula')
    expect(eula).toBeTruthy()
  })

  test('Should dispatch an abort success action and close when cancel button is clicked', () => {
    const cancelButton = component.getByTestId('update-cancel')
    expect(cancelButton).toBeTruthy()
    fireEvent.click(cancelButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'actionsService/SYSTEM_UPDATE_ACTION_ABORT_SUCCESS',
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'dialogs/CLOSE_DIALOG',
    })
  })

  test('It should show the Agree button', () => {
    const agree = component.getByTestId('update-agree')
    expect(agree).toBeTruthy()
  })
})

describe('UpdateDialog (mockStore) - AFTER accepting agreement', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<UpdateDialog />)(mockedStore)
    const agree = component.getByTestId('update-agree')
    fireEvent.click(agree)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })
  test('It should show the second title "2"', () => {
    const title = component.getByTestId('update-title')
    expect(title).toBeTruthy()
    expect(
      screen.getByText(t('firmwareUpdate.dialog.title2', 'wrong') as string)
    ).toBeTruthy()
  })

  test('It should show the second headline "2"', () => {
    const headline = component.getByTestId('update-headline')
    expect(headline).toBeTruthy()
    expect(
      screen.getByText(t('firmwareUpdate.dialog.headline2', 'wrong') as string)
    ).toBeTruthy()
  })

  test('It should show the update reboot text', () => {
    const reboot = component.getByTestId('update-reboot')
    expect(reboot).toBeTruthy()
    expect(
      screen.getByText(t('firmwareUpdate.dialog.headline3', 'wrong') as string)
    ).toBeTruthy()
  })

  test('Should dispatch an abort success action and close when cancel button is clicked', () => {
    const cancelButton = component.getByTestId('update-cancel')
    expect(cancelButton).toBeTruthy()
    fireEvent.click(cancelButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'actionsService/SYSTEM_UPDATE_ACTION_ABORT_SUCCESS',
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'dialogs/CLOSE_DIALOG',
    })
  })

  test('It should show the Yes button to start updating', () => {
    const start = component.getByTestId('update-start')
    expect(start).toBeTruthy()
  })

  test('It should dispatch the start update action if the Yes button is pressed', () => {
    const start = component.getByTestId('update-start')
    expect(start).toBeTruthy()
    fireEvent.click(start)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'actionsService/SYSTEM_UPDATE_ACTION_START_REQUEST',
    })
  })

  test('It should hide the cancel button fi the update process has started', () => {
    const start = component.getByTestId('update-start')
    expect(start).toBeTruthy()
    fireEvent.click(start)
    expect(screen.queryByTestId('update-cancel')).not.toBeInTheDocument()
  })

  // TODO maybe in the future the abort action will be implemented
  /* test('It should dispatch the abort update action and close if the update is in progress', () => {
    const start = component.getByTestId('update-start')
    expect(start).toBeTruthy()
    fireEvent.click(start)
    const cancelButton = component.getByTestId('update-cancel')
    expect(cancelButton).toBeTruthy()
    fireEvent.click(cancelButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'actionsService/SYSTEM_UPDATE_ACTION_ABORT_REQUEST',
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'dialogs/CLOSE_DIALOG',
    })
  }) */
})
