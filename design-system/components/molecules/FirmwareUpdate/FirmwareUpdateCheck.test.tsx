import { fireEvent, queries, RenderResult } from '@testing-library/react'
import { FirmwareUpdate } from 'components/molecules/FirmwareUpdate/FirmwareUpdate'
import { t } from 'i18n/config'
import { mergeDeepRight } from 'ramda'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'

const mockDispatch = jest.fn()

describe('FirmwareUpdateCheck (mockstore) errors', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    /** mock the anchor element */
    const mockAnchorEl = document.createElement('div')
    mockAnchorEl.innerHTML = '<div id="hamburgerMenu">---</div>'
    document.body.appendChild(mockAnchorEl)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should show an error if no internet is available', () => {
    const mergedStore = mergeDeepRight(mockStore, {
      system: {
        responsiveness: {
          connection: {
            internet: {
              health: -1,
            },
          },
        },
      },
    })
    const mockedStore = configureMockStore()(mergedStore)
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
    expect(component.getByTestId('check-update-noInternet')).toBeTruthy()
  })

  test('It should show an error if the check update failed', () => {
    const mergedStore = mergeDeepRight(mockStore, {
      system: {
        checkUpdateError: true,
      },
    })
    const mockedStore = configureMockStore()(mergedStore)
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
    expect(component.getByTestId('check-update-error')).toBeTruthy()
    expect(component.getByTestId('retry-button')).toBeTruthy()
  })

  test('It should dispatch a GET check update if retry button is pressed', () => {
    const mergedStore = mergeDeepRight(mockStore, {
      system: {
        checkUpdateError: true,
      },
    })
    const mockedStore = configureMockStore()(mergedStore)
    mockedStore.dispatch = mockDispatch
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
    const retryButton = component.getByTestId('retry-button')
    expect(retryButton).toBeTruthy()
    fireEvent.click(retryButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'systemService/CHECK_UPDATE_REQUEST',
      payload: { userRequest: true },
    })
  })

  test('It should show an alert if maintenance is over', () => {
    const mergedStore = mergeDeepRight(mockStore, {
      system: {
        checkUpdate: {
          version: '1.0.0',
          newUpdate: true,
          changelog: 'changelog',
          coveredByMaintenance: false,
        },
      },
    })
    const mockedStore = configureMockStore()(mergedStore)
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
    expect(component.getByTestId('license-expired')).toBeTruthy()
  })
})

describe('FirmwareUpdateCheck (mockstore) update available', () => {
  let component: RenderResult<typeof queries>
  const mergedStore = mergeDeepRight(mockStore, {
    system: {
      checkUpdate: {
        version: '1.0.0',
        newUpdate: true,
        changelog: 'changelog',
        coveredByMaintenance: true,
      },
    },
  })
  const mockedStore = configureMockStore()(mergedStore)

  beforeEach(() => {
    /** mock the anchor element */
    const mockAnchorEl = document.createElement('div')
    mockAnchorEl.innerHTML = '<div id="hamburgerMenu">---</div>'
    document.body.appendChild(mockAnchorEl)
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
  })

  afterEach(() => {})

  test('It should show an update available message', () => {
    expect(component.getByTestId('check-update-available')).toBeTruthy()
  })

  test('It should show the version', () => {
    expect(component.getByTestId('available-version')).toBeTruthy()
    const text = t('checkUpdate.versionAvailable', 'version available!', {
      updateAvailableVersion: '1.0.0',
    })
    expect(component.getByText(text)).toBeTruthy()
  })

  test('It should show the changelog', () => {
    expect(component.getByTestId('changelog-list')).toBeTruthy()
    const text = 'changelog'
    expect(component.getByText(text)).toBeTruthy()
  })

  test('It should show a button for myWorld download', () => {
    expect(component.getByTestId('myworld-cta')).toBeTruthy()
  })
})

describe('FirmwareUpdateCheck (mockstore) system up-to-date', () => {
  let component: RenderResult<typeof queries>
  const mockedStore = configureMockStore()(mockStore)
  mockedStore.dispatch = mockDispatch

  beforeEach(() => {
    /** mock the anchor element */
    const mockAnchorEl = document.createElement('div')
    mockAnchorEl.innerHTML = '<div id="hamburgerMenu">---</div>'
    document.body.appendChild(mockAnchorEl)
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should show the up-to-date box', () => {
    expect(component.getByTestId('check-update-uptodate')).toBeTruthy()
  })

  test('It should show a button to retrive the check update information', () => {
    expect(component.getByTestId('check-button')).toBeTruthy()
  })

  test('It should dispatch a GET check update if check button is pressed', () => {
    const checkButton = component.getByTestId('check-button')
    expect(checkButton).toBeTruthy()
    fireEvent.click(checkButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'systemService/CHECK_UPDATE_REQUEST',
      payload: { userRequest: true },
    })
  })
})

describe('FirmwareUpdateCheck (mockstore) usb with a valid installer', () => {
  let component: RenderResult<typeof queries>
  const mergedStore = mergeDeepRight(mockStore, {
    system: {
      updateInfo: {
        version: '1.1.0',
      },
    },
  })
  const mockedStore = configureMockStore()(mergedStore)

  beforeEach(() => {
    /** mock the anchor element */
    const mockAnchorEl = document.createElement('div')
    mockAnchorEl.innerHTML = '<div id="hamburgerMenu">---</div>'
    document.body.appendChild(mockAnchorEl)
    component = renderWithProvider(<FirmwareUpdate />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should NOT show the update check grid component', () => {
    expect(
      component.queryByTestId('check-update-component')
    ).not.toBeInTheDocument()
  })
})
