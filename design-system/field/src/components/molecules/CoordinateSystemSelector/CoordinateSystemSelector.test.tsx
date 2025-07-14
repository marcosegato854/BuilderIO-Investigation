import {
  fireEvent,
  queries,
  RenderResult,
  screen,
} from '@testing-library/react'
import { Formik } from 'formik'
import { t } from 'i18n/config'
import { mergeDeepRight } from 'ramda'
import configureMockStore from 'redux-mock-store'
import { Wkt } from 'store/features/coordsys/types'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import CoordinateSystemSelector from './CoordinateSystemSelector'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initialValuesStore: any = configureMockStore()(mockStore)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lastImportedStore: any = configureMockStore()(
  mergeDeepRight(mockStore, {
    coordinateSystemService: {
      lastImported: {
        name: 'CustomName',
      },
    },
  })
)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customImportedStore: any = configureMockStore()(
  mergeDeepRight(mockStore, {
    coordinateSystemService: {
      currentSystem: {
        name: 'CustomName',
        isAutomatic: false,
      },
      system: {
        name: 'CustomName',
        transformation: 'CustomName',
        ellipsoid: 'CustomName',
        projection: 'CustomName',
        geoidModel: 'CustomName',
        cscsModel: 'CustomName',
        wkt: Wkt.MISSING,
        canDelete: true,
      },
      lastImported: {
        name: 'CustomName',
      },
    },
  })
)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customImportedWktStore: any = configureMockStore()(
  mergeDeepRight(mockStore, {
    coordinateSystemService: {
      currentSystem: {
        name: 'CustomName',
        isAutomatic: false,
      },
      system: {
        name: 'CustomName',
        transformation: 'CustomName',
        ellipsoid: 'CustomName',
        projection: 'CustomName',
        geoidModel: 'CustomName',
        cscsModel: 'CustomName',
        wkt: Wkt.LOADED,
        canDelete: true,
      },
      lastImported: {
        name: 'CustomName',
      },
    },
  })
)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const automaticNameStore: any = configureMockStore()(
  mergeDeepRight(mockStore, {
    coordinateSystemService: {
      currentSystem: {
        name: 'AutomaticName',
        isAutomatic: true,
      },
      lastImported: {
        name: 'CustomName',
      },
    },
  })
)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
initialValuesStore.dispatch = mockDispatch
lastImportedStore.dispatch = mockDispatch
customImportedStore.dispatch = mockDispatch
customImportedWktStore.dispatch = mockDispatch

describe('CoordinateSystemSelector (mockstore) - automatic selection', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <CoordinateSystemSelector label="test" isLocked={false} />
      </Formik>
    )(initialValuesStore)
    // jest.useFakeTimers()
  })

  afterEach(() => {
    // jest.useRealTimers()
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display the label', () => {
    expect(component.getByText('test')).toBeTruthy()
  })

  test('It should call the lastImported API on mount', () => {
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'coordsys/GET_LAST_IMPORTED_COORDINATE_SYSTEM_REQUEST',
    })
  })

  test('It should show the select component', () => {
    expect(component.getByTestId('coordinateSystem_selector')).toBeTruthy()
    expect(component.getByTestId('coordinateSystem_select')).toBeTruthy()
  })

  test('It should show the automatic option', async () => {
    const select = component.getByText(
      t('coordsys.selection.automatic', 'wrong') as string
    )
    fireEvent.mouseDown(select)
    expect(component.getByTestId('coordsys_automatic')).toBeTruthy()
  })

  test('It should show the import from USB option', () => {
    const select = component.getByText(
      t('coordsys.selection.automatic', 'wrong') as string
    )
    fireEvent.mouseDown(select)
    expect(component.getByTestId('coordsys_import')).toBeTruthy()
  })

  test('it should NOT show the last imported option if unavailable', () => {
    const select = component.getByText(
      t('coordsys.selection.automatic', 'wrong') as string
    )
    fireEvent.mouseDown(select)
    expect(component.queryByTestId('coordsys_lastImported')).toBeFalsy()
  })

  test('It should call the import system dialog if Import from USB is pressed', () => {
    const select = component.getByText(
      t('coordsys.selection.automatic', 'wrong') as string
    )
    fireEvent.mouseDown(select)
    const importOption = component.getByTestId('coordsys_import')
    fireEvent.click(importOption)
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: {
        component: 'ImportCoordinateSystemDialog',
        componentProps: {
          file_type: 'csys',
        },
      },
      type: 'dialogs/OPEN_DIALOG',
    })
  })
})

describe('CoordinateSystemSelector (mockstore) - lastImported available', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <CoordinateSystemSelector label="test" isLocked={false} />
      </Formik>
    )(lastImportedStore)
    // jest.useFakeTimers()
  })

  afterEach(() => {
    // jest.useRealTimers()
    mockDispatch.mockClear()
  })

  test('It should show the automatic option', async () => {
    const select = component.getByText(
      t('coordsys.selection.automatic', 'wrong') as string
    )
    fireEvent.mouseDown(select)
    expect(component.getByTestId('coordsys_automatic')).toBeTruthy()
  })

  test('It should show the import from USB option', () => {
    const select = component.getByText(
      t('coordsys.selection.automatic', 'wrong') as string
    )
    fireEvent.mouseDown(select)
    expect(component.getByTestId('coordsys_import')).toBeTruthy()
  })

  test('it should show the last imported option if available', () => {
    const select = component.getByText(
      t('coordsys.selection.automatic', 'wrong') as string
    )
    fireEvent.mouseDown(select)
    expect(component.getByTestId('coordsys_lastImported')).toBeTruthy()
    expect(screen.getByText('CustomName')).toBeTruthy()
  })
})

describe('CoordinateSystemSelector (mockstore) - custom system loaded', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <CoordinateSystemSelector label="test" isLocked={false} />
      </Formik>
    )(customImportedStore)
    // jest.useFakeTimers()
  })

  afterEach(() => {
    // jest.useRealTimers()
    mockDispatch.mockClear()
  })

  test('It should show the custom system as selected', () => {
    expect(component.getByText('CustomName')).toBeTruthy()
  })

  test('It should show the automatic option', async () => {
    const select = component.getByText('CustomName')
    fireEvent.mouseDown(select)
    expect(component.getByTestId('coordsys_automatic')).toBeTruthy()
  })

  test('It should show the custom option', async () => {
    const select = component.getByText('CustomName')
    fireEvent.mouseDown(select)
    expect(component.getByTestId('coordsys_custom')).toBeTruthy()
  })

  test('It should show the import from USB option', () => {
    const select = component.getByText('CustomName')
    fireEvent.mouseDown(select)
    expect(component.getByTestId('coordsys_import')).toBeTruthy()
  })

  test('it should NOT show the last imported option if available', () => {
    const select = component.getByText('CustomName')
    fireEvent.mouseDown(select)
    expect(component.queryByTestId('coordsys_lastImported')).toBeFalsy()
  })

  test('It should show the delete button (if the system can be deleted)', () => {
    expect(component.getByTestId('systemDelete_btn')).toBeTruthy()
  })

  test('It should show a confirmation dialog if the delete button is pressed', () => {
    const button = component.getByTestId('systemDelete_btn')
    fireEvent.click(button)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'dialogs/OPEN_DIALOG' })
    )
  })

  test('It should show the alert info button (if the system has information)', () => {
    expect(component.getByTestId('systemInfoWarning_btn')).toBeTruthy()
  })
})

describe('CoordinateSystemSelector (mockstore) - custom system loaded + wkt', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <CoordinateSystemSelector label="test" isLocked={false} />
      </Formik>
    )(customImportedWktStore)
    // jest.useFakeTimers()
  })

  afterEach(() => {
    // jest.useRealTimers()
    mockDispatch.mockClear()
  })

  test('It should show the info button (if the system has information)', () => {
    expect(component.getByTestId('systemInfo_btn')).toBeTruthy()
  })
})

describe('CoordinateSystemSelector (mockstore) - automatic with name', () => {
  let component: RenderResult<typeof queries>

  const expectedName = `${
    t('coordsys.selection.automatic', 'wrong') as string
  } (AutomaticName)`

  beforeEach(() => {
    component = renderWithProvider(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <CoordinateSystemSelector label="test" isLocked={false} />
      </Formik>
    )(automaticNameStore)
    // jest.useFakeTimers()
  })

  afterEach(() => {
    // jest.useRealTimers()
    mockDispatch.mockClear()
  })

  test('It should show the custom system as selected', () => {
    expect(component.getByText(expectedName)).toBeTruthy()
  })

  test('It should show the import from USB option', () => {
    const select = component.getByText(expectedName)
    fireEvent.mouseDown(select)
    expect(component.getByTestId('coordsys_import')).toBeTruthy()
  })

  test('it should show the last imported option if available', () => {
    const select = component.getByText(expectedName)
    fireEvent.mouseDown(select)
    expect(component.getByTestId('coordsys_lastImported')).toBeTruthy()
  })
})

describe('CoordinateSystemSelector (mockstore) - system locked', () => {
  let component: RenderResult<typeof queries>

  const expectedName = `${
    t('coordsys.selection.automatic', 'wrong') as string
  } (AutomaticName)`

  beforeEach(() => {
    component = renderWithProvider(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <CoordinateSystemSelector label="test" isLocked={true} />
      </Formik>
    )(automaticNameStore)
    // jest.useFakeTimers()
  })

  afterEach(() => {
    // jest.useRealTimers()
    mockDispatch.mockClear()
  })

  test('It should show the custom system as selected', () => {
    expect(component.getByText(expectedName)).toBeTruthy()
  })

  test('It should disable the select component', () => {
    const select = component.getByTestId('coordinateSystem_select')
    expect(select.getAttribute('class')).toContain('Mui-disabled')
  })

  test('It should NOT show the delete icon', () => {
    expect(component.queryByTestId('systemDelete_btn')).toBeFalsy()
  })
})
