import { combineReducers } from 'redux'
import { createSelector } from 'reselect'
import {
  CoordinateSystem,
  CoordinateSystemDeleteRequest,
  CoordinateSystemDeleteResponse,
  CoordinateSystemFile,
  CoordinateSystemGetRequest,
  CoordinateSystemGetResponse,
  CoordinateSystemImportSystemRequest,
  CoordinateSystemImportSystemResponse,
  CoordinateSystemLastImported,
  CoordinateSystemListSystemsResponse,
  CoordinateSystemWktDeleteRequest,
  CoordinateSystemWktDeleteResponse,
  CoordinateSystemWktFile,
  CoordinateSystemWktGetRequest,
  CoordinateSystemWktImportInfoRequest,
  CoordinateSystemWktImportRequest,
  CoordinateSystemWktImportResponse,
  CoordinateSystemWktListResponse,
  CoordinateSystemWktResponse,
  CurrentCoordinateSystem,
} from 'store/features/coordsys/types'
import { dataStorageProjectDetailActions } from 'store/features/dataStorage/slice'
import { resetStoreAction } from 'store/features/global/slice'
import {
  ActionType,
  createAction,
  createAsyncAction,
  createReducer,
} from 'typesafe-actions'
import { AnyObject } from 'yup/lib/object'

/** CRUD */
export const getCoordinateSystemActions = createAsyncAction(
  'coordsys/GET_COORDINATE_SYSTEM_REQUEST',
  'coordsys/GET_COORDINATE_SYSTEM_SUCCESS',
  'coordsys/GET_COORDINATE_SYSTEM_FAILURE'
)<CoordinateSystemGetRequest, CoordinateSystemGetResponse, undefined>()

export const deleteCoordinateSystemActions = createAsyncAction(
  'coordsys/DELETE_COORDINATE_SYSTEM_REQUEST',
  'coordsys/DELETE_COORDINATE_SYSTEM_SUCCESS',
  'coordsys/DELETE_COORDINATE_SYSTEM_FAILURE'
)<CoordinateSystemDeleteRequest, CoordinateSystemDeleteResponse, undefined>()

export const listCoordinateSystemsStartActions = createAsyncAction(
  'coordsys/LIST_COORDINATE_SYSTEMS_START_REQUEST',
  'coordsys/LIST_COORDINATE_SYSTEMS_START_SUCCESS',
  'coordsys/LIST_COORDINATE_SYSTEMS_START_FAILURE'
)<undefined, CoordinateSystemListSystemsResponse, undefined>()

export const listCoordinateSystemsInfoActions = createAsyncAction(
  'coordsys/LIST_COORDINATE_SYSTEMS_INFO_REQUEST',
  'coordsys/LIST_COORDINATE_SYSTEMS_INFO_SUCCESS',
  'coordsys/LIST_COORDINATE_SYSTEMS_INFO_FAILURE'
)<undefined, CoordinateSystemListSystemsResponse, undefined>()

export const importCoordinateSystemStartActions = createAsyncAction(
  'coordsys/IMPORT_COORDINATE_SYSTEM_START_REQUEST',
  'coordsys/IMPORT_COORDINATE_SYSTEM_START_SUCCESS',
  'coordsys/IMPORT_COORDINATE_SYSTEM_START_FAILURE'
)<
  CoordinateSystemImportSystemRequest,
  CoordinateSystemImportSystemResponse,
  undefined
>()

export const importCoordinateSystemInfoActions = createAsyncAction(
  'coordsys/IMPORT_COORDINATE_SYSTEM_INFO_REQUEST',
  'coordsys/IMPORT_COORDINATE_SYSTEM_INFO_SUCCESS',
  'coordsys/IMPORT_COORDINATE_SYSTEM_INFO_FAILURE'
)<undefined, CoordinateSystemImportSystemResponse, undefined>()

export const getCoordinateSystemWktActions = createAsyncAction(
  'coordsys/GET_COORDINATE_SYSTEM_WKT_REQUEST',
  'coordsys/GET_COORDINATE_SYSTEM_WKT_SUCCESS',
  'coordsys/GET_COORDINATE_SYSTEM_WKT_FAILURE'
)<CoordinateSystemWktGetRequest, CoordinateSystemWktResponse, undefined>()

export const deleteCoordinateSystemWktActions = createAsyncAction(
  'coordsys/DELETE_COORDINATE_SYSTEM_WKT_REQUEST',
  'coordsys/DELETE_COORDINATE_SYSTEM_WKT_SUCCESS',
  'coordsys/DELETE_COORDINATE_SYSTEM_WKT_FAILURE'
)<
  CoordinateSystemWktDeleteRequest,
  CoordinateSystemWktDeleteResponse,
  undefined
>()

export const listCoordinateSystemWktStartActions = createAsyncAction(
  'coordsys/LIST_COORDINATE_SYSTEMS_WKT_START_REQUEST',
  'coordsys/LIST_COORDINATE_SYSTEMS_WKT_START_SUCCESS',
  'coordsys/LIST_COORDINATE_SYSTEMS_WKT_START_FAILURE'
)<undefined, CoordinateSystemWktListResponse, undefined>()

export const listCoordinateSystemWktInfoActions = createAsyncAction(
  'coordsys/LIST_COORDINATE_SYSTEMS_WKT_INFO_REQUEST',
  'coordsys/LIST_COORDINATE_SYSTEMS_WKT_INFO_SUCCESS',
  'coordsys/LIST_COORDINATE_SYSTEMS_WKT_INFO_FAILURE'
)<undefined, CoordinateSystemWktListResponse, undefined>()

export const importCoordinateSystemWktStartActions = createAsyncAction(
  'coordsys/IMPORT_COORDINATE_SYSTEM_WKT_START_REQUEST',
  'coordsys/IMPORT_COORDINATE_SYSTEM_WKT_START_SUCCESS',
  'coordsys/IMPORT_COORDINATE_SYSTEM_WKT_START_FAILURE'
)<
  CoordinateSystemWktImportRequest,
  CoordinateSystemWktImportResponse,
  undefined
>()

export const importCoordinateSystemWktInfoActions = createAsyncAction(
  'coordsys/IMPORT_COORDINATE_SYSTEM_WKT_INFO_REQUEST',
  'coordsys/IMPORT_COORDINATE_SYSTEM_WKT_INFO_SUCCESS',
  'coordsys/IMPORT_COORDINATE_SYSTEM_WKT_INFO_FAILURE'
)<
  CoordinateSystemWktImportInfoRequest,
  CoordinateSystemWktImportResponse,
  undefined
>()

export const getLastImportedCoordinateSystemActions = createAsyncAction(
  'coordsys/GET_LAST_IMPORTED_COORDINATE_SYSTEM_REQUEST',
  'coordsys/GET_LAST_IMPORTED_COORDINATE_SYSTEM_SUCCESS',
  'coordsys/GET_LAST_IMPORTED_COORDINATE_SYSTEM_FAILURE'
)<undefined, CoordinateSystemLastImported, undefined>()

export const importCoordinateSystemDone = createAction(
  'coordsys/IMPORT_COORDINATE_SYSTEM_DONE'
)()

export const listWktFilesDone = createAction('coordsys/LIST_WKT_FILES_DONE')()

export const importWktFileDone = createAction('coordsys/IMPORT_WKT_FILE_DONE')()

export const setCurrentCoordinateSystem = createAction(
  'coordsys/SET_CURRENT_SYSTEM'
)<CurrentCoordinateSystem | null>()

const actions = {
  getCoordinateSystemActions,
  deleteCoordinateSystemActions,
  listCoordinateSystemsStartActions,
  listCoordinateSystemsInfoActions,
  importCoordinateSystemStartActions,
  importCoordinateSystemInfoActions,
  getCoordinateSystemWktActions,
  deleteCoordinateSystemWktActions,
  listCoordinateSystemWktStartActions,
  listCoordinateSystemWktInfoActions,
  importCoordinateSystemWktStartActions,
  importCoordinateSystemWktInfoActions,
  getLastImportedCoordinateSystemActions,
  importCoordinateSystemDone,
  listWktFilesDone,
  importWktFileDone,
  setCurrentCoordinateSystem,
}
export type CoordinateSystemActions = ActionType<typeof actions>

/**
 * REDUCERS
 */

type CoordinateSystemServiceState = Readonly<{
  system: CoordinateSystem | null
  currentSystem: CurrentCoordinateSystem | null
  wkt: CoordinateSystemWktFile | null
  lastImported: CoordinateSystemLastImported | null
  systemImported: boolean
  wktImported: boolean
  fileList: CoordinateSystemFile[] | null
}>

const initialState: CoordinateSystemServiceState = {
  system: null,
  currentSystem: null,
  wkt: null,
  lastImported: null,
  systemImported: false,
  wktImported: false,
  fileList: null,
}

const system = createReducer(initialState.system)
  .handleAction(
    getCoordinateSystemActions.success,
    (prevState: CoordinateSystem | null, { payload }) => payload
  )
  .handleAction(
    [
      deleteCoordinateSystemActions.success,
      getCoordinateSystemActions.request,
      setCurrentCoordinateSystem,
    ],
    () => null
  )
  .handleAction(resetStoreAction, () => initialState.system)

const currentSystem = createReducer(initialState.currentSystem)
  .handleAction(
    importCoordinateSystemWktStartActions.request,
    (prevState: CurrentCoordinateSystem | null, { payload }) => {
      return { name: payload.name, isAutomatic: false }
    }
  )
  /* .handleAction(listWktFilesDone, () => null) */
  .handleAction(
    dataStorageProjectDetailActions.success,
    (prevState: CurrentCoordinateSystem | null, { payload }) => {
      return {
        name: payload.coordinate?.name || 'automatic',
        isAutomatic: payload.coordinate?.automatic ?? true,
      }
    }
  )
  .handleAction(
    setCurrentCoordinateSystem,
    (prevState: CurrentCoordinateSystem | null, { payload }) => payload
  )
  .handleAction(
    importCoordinateSystemInfoActions.success,
    (prevState: CurrentCoordinateSystem | null, { payload }) => {
      if (payload.result)
        return { name: payload.result.name, isAutomatic: false }
      return prevState
    }
  )
  .handleAction(resetStoreAction, () => initialState.currentSystem)

const wkt = createReducer(initialState.wkt)
  .handleAction(
    getCoordinateSystemWktActions.success,
    (prevState: CoordinateSystemWktFile | null, { payload }) => payload
  )
  .handleAction(
    [
      deleteCoordinateSystemWktActions.success,
      deleteCoordinateSystemActions.success,
      getCoordinateSystemActions.request,
      setCurrentCoordinateSystem,
    ],
    () => null
  )
  .handleAction(resetStoreAction, () => initialState.wkt)

const lastImported = createReducer(initialState.lastImported)
  .handleAction(
    getLastImportedCoordinateSystemActions.success,
    (prevState: CoordinateSystemLastImported | null, { payload }) => payload
  )
  .handleAction(resetStoreAction, () => initialState.lastImported)

const systemImported = createReducer(initialState.systemImported)
  .handleAction(
    [
      listCoordinateSystemsStartActions.request,
      listCoordinateSystemWktStartActions.request,
      importCoordinateSystemStartActions.request,
      importCoordinateSystemWktStartActions.request,
    ],
    () => false
  )
  .handleAction(importCoordinateSystemDone, () => true)
  .handleAction(resetStoreAction, () => initialState.systemImported)

const wktImported = createReducer(initialState.wktImported)
  .handleAction(
    [
      listCoordinateSystemsStartActions.request,
      listCoordinateSystemWktStartActions.request,
      importCoordinateSystemStartActions.request,
      importCoordinateSystemWktStartActions.request,
    ],
    () => false
  )
  .handleAction(importWktFileDone, () => true)
  .handleAction(resetStoreAction, () => initialState.wktImported)

const fileList = createReducer(initialState.fileList)
  .handleAction(
    [
      listCoordinateSystemsStartActions.request,
      listCoordinateSystemWktStartActions.request,
      importCoordinateSystemStartActions.request,
      importCoordinateSystemWktStartActions.request,
    ],
    () => null
  )
  .handleAction(
    [
      listCoordinateSystemsStartActions.success,
      listCoordinateSystemsInfoActions.success,
      listCoordinateSystemWktStartActions.success,
      listCoordinateSystemWktInfoActions.success,
    ],
    (prevState: CoordinateSystemFile[] | null, { payload }) => {
      if (payload.action.status === 'error') return []
      return payload.result?.files || prevState
    }
  )
  .handleAction(
    [
      listCoordinateSystemsStartActions.failure,
      listCoordinateSystemsInfoActions.failure,
      listCoordinateSystemWktStartActions.failure,
      listCoordinateSystemWktInfoActions.failure,
    ],
    () => []
  )
  .handleAction(
    [
      importCoordinateSystemStartActions.failure,
      importCoordinateSystemWktStartActions.failure,
      importCoordinateSystemInfoActions.failure,
      importCoordinateSystemWktInfoActions.failure,
    ],
    (prevState: CoordinateSystemFile[] | null) => prevState
  )
  .handleAction(resetStoreAction, () => initialState.fileList)

export const coordsysServiceReducer = combineReducers({
  system,
  currentSystem,
  wkt,
  lastImported,
  systemImported,
  wktImported,
  fileList,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      coordinateSystemService: CoordinateSystemServiceState
    }
  | AnyObject
export const selectCoordinateSystemServiceState = (
  state: OptimizedRootState
): CoordinateSystemServiceState => state.coordinateSystemService

export const selectSystemInformation = (state: OptimizedRootState) =>
  selectCoordinateSystemServiceState(state).system

export const selectCurrentSystem = (state: OptimizedRootState) =>
  selectCoordinateSystemServiceState(state).currentSystem

export const selectWktInformation = (state: OptimizedRootState) =>
  selectCoordinateSystemServiceState(state).wkt

export const selectLastImported = (state: OptimizedRootState) =>
  selectCoordinateSystemServiceState(state).lastImported

export const selectSystemImported = (state: OptimizedRootState) =>
  selectCoordinateSystemServiceState(state).systemImported

export const selectWktImported = (state: OptimizedRootState) =>
  selectCoordinateSystemServiceState(state).wktImported

export const selectFileList = createSelector(
  selectCoordinateSystemServiceState,
  (data) => data.fileList
)

export const selectIsAnyImported = createSelector(
  selectCoordinateSystemServiceState,
  (state) => state.systemImported || state.wktImported
)
