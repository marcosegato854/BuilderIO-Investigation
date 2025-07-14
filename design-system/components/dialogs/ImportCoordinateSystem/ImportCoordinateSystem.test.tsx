import {
  fireEvent,
  queries,
  RenderResult,
  screen,
} from '@testing-library/react'
import ImportCoordinateSystem from 'components/dialogs/ImportCoordinateSystem/ImportCoordinateSystem'
import { t } from 'i18n/config'
import configureMockStore from 'redux-mock-store'
import { closeDialogAction } from 'store/features/dialogs/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
// import {
//   importShpStartActions,
//   listShpStartActions,
// } from 'store/features/planning/slice'
import { mergeDeepRight } from 'ramda'
import {
  importCoordinateSystemStartActions,
  importCoordinateSystemWktStartActions,
  listCoordinateSystemsStartActions,
  listCoordinateSystemWktStartActions,
} from 'store/features/coordsys/slice'
import { getType } from 'typesafe-actions'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const InitialValuesStore: any = configureMockStore()(
  mergeDeepRight(mockStore, {
    coordinateSystemService: {
      fileList: null,
    },
  })
)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EmptyValuesStore: any = configureMockStore()(
  mergeDeepRight(mockStore, {
    coordinateSystemService: {
      fileList: [],
    },
  })
)
// eslint-disable-next-line @typescript-eslint/no-explicit-any

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch
InitialValuesStore.dispatch = mockDispatch
EmptyValuesStore.dispatch = mockDispatch

describe('ImportCoordinateSystem (mockstore - no file list)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<ImportCoordinateSystem />)(
      InitialValuesStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should display the loading spinner', () => {
    expect(component.getByTestId('spinner')).toBeTruthy()
  })

  test('It should NOT display the list', () => {
    expect(screen.queryByTestId('import-coordsys-list')).not.toBeInTheDocument()
  })

  test('Should disable the refresh button', () => {
    const refreshButton = component.getByTestId('refresh-button')
    expect(refreshButton).toHaveAttribute('disabled')
  })

  test('It should call a close action when clicking cancel', () => {
    const cancelButton = component.getByText(
      t('coordsys.importDialog.cancel', 'wrong') as string
    )
    fireEvent.click(cancelButton)
    expect(mockDispatch).toHaveBeenCalledWith(closeDialogAction())
  })
})

describe('ImportCoordinateSystem (mockstore - empty file list)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<ImportCoordinateSystem />)(EmptyValuesStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should NOT display the loading spinner', () => {
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
  })

  test('It should NOT display the list', () => {
    expect(screen.queryByTestId('import-coordsys-list')).not.toBeInTheDocument()
  })

  test('Should display the refresh button', () => {
    const refreshButton = component.getByText(
      t('coordsys.importDialog.refresh', 'wrong') as string
    )
    expect(refreshButton).toBeTruthy()
    expect(refreshButton).not.toHaveAttribute('disabled')
  })

  test('It should call a close action when clicking cancel', () => {
    const cancelButton = component.getByText(
      t('coordsys.importDialog.cancel', 'wrong') as string
    )
    fireEvent.click(cancelButton)
    expect(mockDispatch).toHaveBeenCalledWith(closeDialogAction())
  })
})

describe('ImportCsysFile (mockStore with file list)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<ImportCoordinateSystem file_type="csys" />)(
      mockedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display csys title', () => {
    const csysTitle = component.getByTestId('csys-title')
    expect(csysTitle).toBeTruthy()
  })

  test('It should display csys subtitle ', () => {
    const wktTitle = component.getByTestId('subtitle')
    expect(wktTitle).toBeTruthy()
    expect(
      screen.getByText(
        t('coordsys.importDialog.csysSubtitle', 'wrong') as string
      )
    ).toBeInTheDocument()
  })

  test('It should call a close action when clicking cancel', () => {
    const cancelButton = component.getByText(
      t('coordsys.importDialog.cancel', 'wrong') as string
    )
    fireEvent.click(cancelButton)
    expect(mockDispatch).toHaveBeenCalledWith(closeDialogAction())
  })

  test('Upload button should be deactivated if no file is selected', () => {
    const uploadButton = component.getByTestId('upload-button')
    expect(uploadButton).toHaveAttribute('disabled')
  })
  test('It should NOT display the loading spinner', () => {
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
  })

  test('Should display the refresh button', () => {
    const refreshButton = component.getByText(
      t('coordsys.importDialog.refresh', 'wrong') as string
    )
    expect(refreshButton).toBeTruthy()
    expect(refreshButton).not.toHaveAttribute('disabled')
  })

  test('It should NOT call the upload action when clicking on the upload button without selection', () => {
    const uploadButton = component.getByText(
      t('coordsys.importDialog.upload', 'upload') as string
    )
    fireEvent.click(uploadButton)
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: getType(importCoordinateSystemStartActions.request),
      })
    )
  })

  test('It should call the upload action when clicking on the upload button', () => {
    const firstItem = component.getByTestId('import-coordsys-row-0')
    fireEvent.click(firstItem)
    const uploadButton = component.getByText(
      t('coordsys.importDialog.upload', 'upload') as string
    )
    fireEvent.click(uploadButton)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: getType(importCoordinateSystemStartActions.request),
      })
    )
  })

  test('It should call the load list action when clicking on the refresh button', () => {
    const refreshButton = component.getByTestId('refresh-button')
    fireEvent.click(refreshButton)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: getType(listCoordinateSystemsStartActions.request),
      })
    )
  })
})

describe('ImportWKTFile (mockStore with file list)', () => {
  let component: RenderResult<typeof queries>
  const test_name = 'custom_csys'

  beforeEach(() => {
    component = renderWithProvider(
      <ImportCoordinateSystem file_type="wkt" csys_name={test_name} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display wkt title and related csys name', () => {
    const csysTitle = component.getByTestId('wkt-title')
    expect(csysTitle).toBeTruthy()
  })

  test('It should display wkt subtitle ', () => {
    const wktTitle = component.getByTestId('subtitle')
    expect(wktTitle).toBeTruthy()
    expect(
      screen.getByText(
        t('coordsys.importDialog.wktSubtitle', 'wrong') as string
      )
    ).toBeInTheDocument()
  })

  test('It should call a close action when clicking cancel', () => {
    const cancelButton = component.getByText(
      t('coordsys.importDialog.cancel', 'wrong') as string
    )
    fireEvent.click(cancelButton)
    expect(mockDispatch).toHaveBeenCalledWith(closeDialogAction())
  })

  test('Upload button should be deactivated if no file is selected', () => {
    const uploadButton = component.getByTestId('upload-button')
    expect(uploadButton).toHaveAttribute('disabled')
  })
  test('It should NOT display the loading spinner', () => {
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
  })

  test('Should display the refresh button', () => {
    const refreshButton = component.getByText(
      t('coordsys.importDialog.refresh', 'wrong') as string
    )
    expect(refreshButton).toBeTruthy()
    expect(refreshButton).not.toHaveAttribute('disabled')
  })

  test('It should NOT call the upload action when clicking on the upload button without selection', () => {
    const uploadButton = component.getByText(
      t('coordsys.importDialog.upload', 'upload') as string
    )
    fireEvent.click(uploadButton)
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: getType(importCoordinateSystemWktStartActions.request),
      })
    )
  })

  test('It should call the upload action when clicking on the upload button', () => {
    const firstItem = component.getByTestId('import-coordsys-row-0')
    fireEvent.click(firstItem)
    const uploadButton = component.getByText(
      t('coordsys.importDialog.upload', 'upload') as string
    )
    fireEvent.click(uploadButton)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: getType(importCoordinateSystemWktStartActions.request),
      })
    )
  })

  test('It should call the load list action when clicking on the refresh button', () => {
    const refreshButton = component.getByTestId('refresh-button')
    fireEvent.click(refreshButton)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: getType(listCoordinateSystemWktStartActions.request),
      })
    )
  })
})
