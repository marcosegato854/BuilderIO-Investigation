import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  within,
} from '@testing-library/react'
import { FirmwareUpdate } from 'components/molecules/FirmwareUpdate/FirmwareUpdate'
import { t } from 'i18n/config'
import { mergeDeepRight } from 'ramda'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'

describe('FirmwareUpdate (mockStore)', () => {
  let component: RenderResult<typeof queries>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mockStore)

  beforeEach(() => {
    /** mock the anchor element */
    const mockAnchorEl = document.createElement('div')
    mockAnchorEl.innerHTML = '<div id="hamburgerMenu">---</div>'
    document.body.appendChild(mockAnchorEl)
  })

  afterEach(() => {})

  test('It should mount', () => {
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
    expect(component).toBeTruthy()
  })

  test('It should display CCP data', () => {
    const ccpLicense = '1111-1111-1111-1111'
    const ccpExpireDate = '01/01/2023'
    const mergedStore = mergeDeepRight(mockStore, {
      system: {
        info: {
          license: {
            field: {
              eid: ccpLicense,
              maintenanceExpiryDate: ccpExpireDate,
            },
          },
        },
      },
    })
    const mockedStore = configureMockStore()(mergedStore)
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
    expect(component.getByText(ccpLicense)).toBeTruthy()
    expect(component.getByText(ccpExpireDate)).toBeTruthy()
  })

  test('It should display the SU & PCU serial number', () => {
    const suSerial = '0000-0000-0000-0001'
    const mergedStore = mergeDeepRight(mockStore, {
      system: {
        info: {
          sensorUnit: {
            serial: suSerial,
          },
        },
      },
    })
    const mockedStore = configureMockStore()(mergedStore)
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
    expect(component.getByText(suSerial)).toBeTruthy()
  })

  test('It should NOT display the SU serial number if missing', () => {
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
    expect(component.getByTestId('no-su-attached')).toBeTruthy()
  })

  test('It should NOT display the PCU serial number if missing', () => {
    const mergedStore = mergeDeepRight(mockStore, {
      system: {
        info: {
          serial: null,
        },
      },
    })
    const mockedStore = configureMockStore()(mergedStore)
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
    expect(
      screen.queryByText(t('firmwareUpdate.pcu', 'wrong') as string)
    ).not.toBeInTheDocument()
  })

  test('It should display update guidelines and no storage label', () => {
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
    expect(component.getByTestId('update-guidelines')).toBeTruthy()
    expect(component.getByTestId('no-storage-label')).toBeTruthy()
  })

  test('It should display update guidelines and no installer detected label', () => {
    const mergedStore = mergeDeepRight(mockStore, {
      system: {
        updateInfo: {
          usbConnected: true,
        },
      },
    })
    const mockedStore = configureMockStore()(mergedStore)
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
    expect(component.getByTestId('update-guidelines')).toBeTruthy()
    expect(component.getByTestId('no-installer-label')).toBeTruthy()
  })

  test('It should display update detected component - no changelog - no prerequisites', () => {
    const installerVersion = '0.0.0.0'
    const mergedStore = mergeDeepRight(mockStore, {
      system: {
        updateInfo: {
          version: installerVersion,
        },
      },
    })
    const mockedStore = configureMockStore()(mergedStore)
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
    expect(component.getByTestId('update-detected')).toBeTruthy()
    expect(screen.queryByTestId('changelog-list')).not.toBeInTheDocument()
    expect(component.getByTestId('update-now-button')).toBeTruthy()
  })

  test('It should display update detected component - changelog', () => {
    const installerVersion = '0.0.0.0'
    const mergedStore = mergeDeepRight(mockStore, {
      system: {
        updateInfo: {
          version: installerVersion,
          changelog: 'mock changelog 1 /n mock changelog 2',
        },
      },
    })
    const mockedStore = configureMockStore()(mergedStore)
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
    expect(component.getByTestId('changelog-list')).toBeTruthy()
  })

  test('It should display update detected component - prerequisites progress', () => {
    const installerVersion = '0.0.0.0'
    const preTitle = 'checking'
    const mergedStore = mergeDeepRight(mockStore, {
      system: {
        updateInfo: {
          version: installerVersion,
        },
        updatePrepareStatus: {
          status: 'progress',
          description: preTitle,
        },
      },
    })
    const mockedStore = configureMockStore()(mergedStore)
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
    expect(component.getByTestId('prerequisites-result')).toBeTruthy()
    expect(component.getByTestId('prerequisites-title')).toBeTruthy()
  })

  test('It should display update detected component - prerequisites error', () => {
    const mergedStore = mergeDeepRight(mockStore, {
      system: {
        updateInfo: {
          version: '0.0.0.0',
        },
        updatePrepareStatus: {
          status: 'error',
          description: 'general error',
          errors: [{ code: 'UPD-101', description: 'UPD-101' }],
        },
      },
    })
    const mockedStore = configureMockStore()(mergedStore)
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
    expect(component.getByTestId('prerequisites-result')).toBeTruthy()
    expect(component.getByTestId('prerequisites-error-title')).toBeTruthy()
  })

  test('It should display last update', () => {
    const firmware = '0.0.0.1'
    const date = '01/01/1900'
    const mergedStore = mergeDeepRight(mockStore, {
      system: {
        updateInfo: {
          lastVersion: firmware,
          lastDate: date,
        },
      },
    })
    const mockedStore = configureMockStore()(mergedStore)
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
    expect(component.getByTestId('last-update')).toBeTruthy()
  })
})

describe('FirmwareUpdate (mockStore) - system error', () => {
  let component: RenderResult<typeof queries>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const systemErrorStore: any = configureMockStore()(
    mergeDeepRight(mockStore, {
      system: {
        updateInfo: {
          version: '0.0.0.0',
        },
        updatePrepareStatus: {
          status: 'error',
          description: 'error',
          errors: [
            { code: 'UPD-101', description: 'UPD-101' },
            { code: 'UPD-101', description: 'UPD-101' },
            { code: 'UPD-102', description: 'UPD-102' },
          ],
        },
      },
    })
  )

  beforeEach(() => {
    /** mock the anchor element */
    const mockAnchorEl = document.createElement('div')
    mockAnchorEl.innerHTML = '<div id="hamburgerMenu">---</div>'
    document.body.appendChild(mockAnchorEl)
    component = renderWithProvider(<FirmwareUpdate />)(systemErrorStore)
  })

  afterEach(() => {})

  test('It should display the system error title', () => {
    expect(component.getByTestId('prerequisites-error-title')).toBeTruthy()
    const expectedTitle = `${
      t('firmwareUpdate.systemError', 'wrong') as string
    } (UPD-101,UPD-102)`
    expect(screen.getByText(expectedTitle)).toBeInTheDocument()
  })

  test('It should list the errors after the title', () => {
    const listContainer = component.getByTestId('errors-list')
    expect(listContainer).toBeTruthy()
    const { getAllByRole } = within(listContainer)
    const items = getAllByRole('listitem')
    expect(items.length).toBe(2)
  })
})

describe('FirmwareUpdate (mockStore) - software error', () => {
  let component: RenderResult<typeof queries>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const systemErrorStore: any = configureMockStore()(
    mergeDeepRight(mockStore, {
      system: {
        updateInfo: {
          version: '0.0.0.0',
        },
        updatePrepareStatus: {
          status: 'error',
          description: 'error',
          errors: [
            { code: 'UPD-205', description: 'UPD-205' },
            { code: 'UPD-206', description: 'UPD-206' },
          ],
        },
      },
    })
  )

  beforeEach(() => {
    /** mock the anchor element */
    const mockAnchorEl = document.createElement('div')
    mockAnchorEl.innerHTML = '<div id="hamburgerMenu">---</div>'
    document.body.appendChild(mockAnchorEl)
    component = renderWithProvider(<FirmwareUpdate />)(systemErrorStore)
  })

  afterEach(() => {})

  test('It should display the software error title', () => {
    expect(component.getByTestId('prerequisites-error-title')).toBeTruthy()
    const expectedTitle = `${
      t('firmwareUpdate.softwareError', 'wrong') as string
    } (UPD-205,UPD-206)`
    expect(screen.getByText(expectedTitle)).toBeInTheDocument()
  })

  test('It should display a generic message after the title', () => {
    expect(component.getByTestId('errors-list')).toBeTruthy()
    expect(
      screen.getByText(t('firmwareUpdate.downloadAgain', 'wrong') as string)
    ).toBeInTheDocument()
  })
})

describe('FirmwareUpdate (mockStore) - how to update guidelines', () => {
  let component: RenderResult<typeof queries>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mockStore)

  beforeEach(() => {
    /** mock the anchor element */
    const mockAnchorEl = document.createElement('div')
    mockAnchorEl.innerHTML = '<div id="hamburgerMenu">---</div>'
    document.body.appendChild(mockAnchorEl)
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
  })
  afterEach(() => {})

  test('It should display the firmware update view when opened', () => {
    expect(component.getByTestId('firmware-update')).toBeTruthy()
  })

  test('It should show a button to access the how to update guide', () => {
    expect(component.getByTestId('how-to-update-button')).toBeTruthy()
  })

  test('It should show the how to update view if the button is clicked', () => {
    const howToUpdateButton = component.getByTestId('how-to-update-button')
    fireEvent.click(howToUpdateButton)
    expect(component.getByTestId('update-guidelines')).toBeTruthy()
  })

  test('It should show the firmware view if the back button is clicked', () => {
    const howToUpdateButton = component.getByTestId('how-to-update-button')
    fireEvent.click(howToUpdateButton)
    const backButton = component.getByTestId('how-to-back-button')
    fireEvent.click(backButton)
    expect(component.getByTestId('firmware-update')).toBeTruthy()
  })
})
