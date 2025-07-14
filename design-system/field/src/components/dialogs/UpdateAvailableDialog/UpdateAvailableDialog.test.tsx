import { fireEvent, queries, RenderResult } from '@testing-library/react'
import UpdateAvailableDialog from 'components/dialogs/UpdateAvailableDialog/UpdateAvailableDialog'
import { mergeDeepRight } from 'ramda'
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

const updateMockedStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      checkUpdate: {
        version: '1.24.1.148',
        changelog:
          'NEW FEATURES\n- INSTALLER: Updated CLM to the latest version 2.14\n- INSTALLER: PEF self-update allows user to update PEF autonomously\n- ACQUISITION:2 million points support for TRKEVO 500/700\n- PROCESSING: New processing workflow allowing the user to process multiple times\n- PROCESSING: Export multi-return values for Optech scanners\n \n \nIMPROVEMENTS\n- PLANNING: Minor bug fixing and improvements \n- PROCESSING: Anonymization improved efficiency',
        coveredByMaintenance: true,
      },
    },
  })
)

updateMockedStore.dispatch = mockDispatch

const licenseExpiredMockedStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      checkUpdate: {
        version: '1.24.1.148',
        changelog:
          'NEW FEATURES\n- INSTALLER: Updated CLM to the latest version 2.14\n- INSTALLER: PEF self-update allows user to update PEF autonomously\n- ACQUISITION:2 million points support for TRKEVO 500/700\n- PROCESSING: New processing workflow allowing the user to process multiple times\n- PROCESSING: Export multi-return values for Optech scanners\n \n \nIMPROVEMENTS\n- PLANNING: Minor bug fixing and improvements \n- PROCESSING: Anonymization improved efficiency',
        coveredByMaintenance: false,
      },
    },
  })
)

describe('UpdateAvailableDialog (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<UpdateAvailableDialog />)(updateMockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should show the version', () => {
    const version = component.getByTestId('version-available')
    expect(version).toBeTruthy()
  })

  test('It should close the dialog when OK is pressed', () => {
    const okButton = component.getByTestId('check-update-ok')
    fireEvent.click(okButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'dialogs/CLOSE_DIALOG',
    })
  })

  test('It should change the checked state', () => {
    const checkboxLabel = component.getByTestId('check-update-checkbox')
    fireEvent.click(checkboxLabel)
    // Since the actual input is nested inside the FormControlLabel, we need to find the input
    const checkbox = checkboxLabel.querySelector('input[type="checkbox"]')
    // Assert that the checkbox is checked
    expect(checkbox).toBeChecked()
    // Click again to uncheck
    fireEvent.click(checkboxLabel)
    expect(checkbox).not.toBeChecked()
  })

  test('It should dispatch a setUpdateSettings action (checkbox set to false)', () => {
    const okButton = component.getByTestId('check-update-ok')
    fireEvent.click(okButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'settings/SET_UPDATE_SETTINGS',
      payload: expect.objectContaining({ hideUpdate: false }),
    })
  })

  test('It should dispatch a setUpdateSettings action (checkbox set to true)', () => {
    const checkboxLabel = component.getByTestId('check-update-checkbox')
    fireEvent.click(checkboxLabel)
    const okButton = component.getByTestId('check-update-ok')
    fireEvent.click(okButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'settings/SET_UPDATE_SETTINGS',
      payload: expect.objectContaining({ hideUpdate: true }),
    })
  })
})

describe('UpdateAvailableDialog (mockStore) license expired', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<UpdateAvailableDialog />)(
      licenseExpiredMockedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should show the expired warning', () => {
    const expired = component.getByTestId('license-expired')
    expect(expired).toBeTruthy()
  })
})
