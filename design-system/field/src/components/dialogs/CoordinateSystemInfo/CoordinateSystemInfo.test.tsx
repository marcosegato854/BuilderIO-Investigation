import {
  fireEvent,
  queries,
  RenderResult,
  screen,
} from '@testing-library/react'
import CoordinateSystemInfo from 'components/dialogs/CoordinateSystemInfo/CoordinateSystemInfo'
import { t } from 'i18n/config'
import configureMockStore from 'redux-mock-store'
import { closeDialogAction } from 'store/features/dialogs/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import React from 'react'
import { getType } from 'typesafe-actions'
import { mergeDeepRight } from 'ramda'
import { Wkt } from 'store/features/coordsys/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)
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
const wktInfoStore: any = configureMockStore()(
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
      wkt: {
        wkt: 'COMPD_CS["UTM33N_egm08_EGM2008 height",PROJCS["UTM33N_egm08",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",500000.00000000000000],PARAMETER["False_Northing",0.00000000000000],PARAMETER["Central_Meridian",15.0],PARAMETER["Scale_Factor",0.9996],PARAMETER["Latitude_Of_Origin",0],UNIT["meters", 1.000000000000]],VERT_CS["EGM2008 height",VERT_DATUM["EGM2008 geoid",2005,AUTHORITY["EPSG","1027"]],UNIT["meters", 1.000000000000],AXIS["Gravity-related height",UP],AUTHORITY["EPSG","3855"]]]',
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
      system: {
        name: 'AutomaticName',
        transformation: 'AutomaticName',
        ellipsoid: 'AutomaticName',
        projection: 'AutomaticName',
        geoidModel: 'AutomaticName',
        cscsModel: 'AutomaticName',
        wkt: Wkt.LOADED,
        canDelete: false,
      },
      lastImported: {
        name: 'CustomName',
      },
      wkt: {
        wkt: 'COMPD_CS["UTM33N_egm08_EGM2008 height",PROJCS["UTM33N_egm08",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",500000.00000000000000],PARAMETER["False_Northing",0.00000000000000],PARAMETER["Central_Meridian",15.0],PARAMETER["Scale_Factor",0.9996],PARAMETER["Latitude_Of_Origin",0],UNIT["meters", 1.000000000000]],VERT_CS["EGM2008 height",VERT_DATUM["EGM2008 geoid",2005,AUTHORITY["EPSG","1027"]],UNIT["meters", 1.000000000000],AXIS["Gravity-related height",UP],AUTHORITY["EPSG","3855"]]]',
      },
    },
  })
)
/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch
customImportedStore.dispatch = mockDispatch
wktInfoStore.dispatch = mockDispatch
automaticNameStore.dispatch = mockDispatch

describe('Coordinate System Info (mockStore) wkt missing', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<CoordinateSystemInfo />)(
      customImportedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should call a close action when clicking close', () => {
    const cancelButton = component.getByTestId('close-button')
    fireEvent.click(cancelButton)
    expect(mockDispatch).toHaveBeenCalledWith(closeDialogAction())
  })

  test('It should display title', () => {
    const title = component.getByText(
      t('coordsys.csysInfo.title', 'wrong') as string
    )
    expect(title).toBeTruthy()
  })

  test('It should display csys info box', () => {
    const csysBox = component.getByTestId('csys-box')
    expect(csysBox).toBeTruthy()
  })

  test('It should display the load button for the missing wkt', () => {
    expect(component.getByTestId('load-wkt-button')).toBeTruthy()
  })

  test('It should dispatch the correct action when load wkt file is clicked', () => {
    const loadButton = component.getByTestId('load-wkt-button')
    fireEvent.click(loadButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: {
        component: 'ImportCoordinateSystemDialog',
        componentProps: {
          file_type: 'wkt',
          csys_name: 'CustomName',
        },
      },
      type: 'dialogs/OPEN_DIALOG',
    })
  })
})

describe('Coordinate System Info (mockStore) wkt loaded', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<CoordinateSystemInfo />)(wktInfoStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should dispatch an action to retrieve the wkt information', () => {
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: { name: 'CustomName' },
      type: 'coordsys/GET_COORDINATE_SYSTEM_WKT_REQUEST',
    })
  })

  test('It should display the view button for the loaded wkt', () => {
    expect(component.getByTestId('view-wkt-button')).toBeTruthy()
  })

  test('It should display overlay when view wkt file is clicked', () => {
    const viewButton = component.getByTestId('view-wkt-button')
    fireEvent.click(viewButton)
    const wktOverlay = component.getByTestId('wkt-overlay')
    expect(wktOverlay).toBeTruthy()
  })

  test('It should show a delete button if the coordinate system is custom', () => {
    const viewButton = component.getByTestId('view-wkt-button')
    fireEvent.click(viewButton)
    const wktDeleteBtn = component.getByTestId('wkt-delete-button')
    expect(wktDeleteBtn).toBeTruthy()
  })

  test('It should show a confirmation dialog if the delete button is pressed', () => {
    const viewButton = component.getByTestId('view-wkt-button')
    fireEvent.click(viewButton)
    const wktDeleteBtn = component.getByTestId('wkt-delete-button')
    fireEvent.click(wktDeleteBtn)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'dialogs/OPEN_DIALOG' })
    )
  })
})

describe('Coordinate System Info (mockStore) automatic coordsys - wkt loaded', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<CoordinateSystemInfo />)(automaticNameStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should dispatch an action to retrieve the wkt information', () => {
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: { name: 'AutomaticName' },
      type: 'coordsys/GET_COORDINATE_SYSTEM_WKT_REQUEST',
    })
  })

  test('It should display the view button for the loaded wkt', () => {
    expect(component.getByTestId('view-wkt-button')).toBeTruthy()
  })

  test('It should display overlay when view wkt file is clicked', () => {
    const viewButton = component.getByTestId('view-wkt-button')
    fireEvent.click(viewButton)
    const wktOverlay = component.getByTestId('wkt-overlay')
    expect(wktOverlay).toBeTruthy()
  })

  test('It should NOT show a delete button if the coordinate system is automatic', () => {
    const viewButton = component.getByTestId('view-wkt-button')
    fireEvent.click(viewButton)
    const wktDeleteBtn = component.queryByTestId('wkt-delete-button')
    expect(wktDeleteBtn).not.toBeInTheDocument()
  })
})
