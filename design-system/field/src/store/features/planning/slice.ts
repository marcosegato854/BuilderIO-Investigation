import {
  append,
  equals,
  insert,
  insertAll,
  isNil,
  mergeDeepRight,
  pipe,
  remove,
  update,
} from 'ramda'
import { combineReducers } from 'redux'
import undoable from 'redux-undo'
import { createSelector } from 'reselect'
import { ActionStatus } from 'store/features/actions/types'
import { resetStoreAction } from 'store/features/global/slice'
import {
  AddPointActionPayload,
  AddPointToPolygonActionPayload,
  DeleteInternalPathActionPayload,
  DeletePolygonActionPayload,
  EditPointActionPayload,
  EditPointInPolygonActionPayload,
  ExtractPolygonDone,
  ExtractPolygonResponse,
  ExtractPolygonStartRequest,
  ImportShpDone,
  ImportShpResponse,
  ImportShpStartRequest,
  InitPlanningPayload,
  JobPlan,
  ListShpResponse,
  Needed,
  Path,
  PlanWarning,
  PlanningDeletePlanRequest,
  PlanningDeletePlanResponse,
  PlanningGetPlanRequest,
  PlanningGetPlanResponse,
  PlanningProcessInfoResponse,
  PlanningProcessStartResponse,
  PlanningProcessingStartRequest,
  PlanningSavePlanRequest,
  PlanningSavePlanResponse,
  PlanningSplitInternalPathPayload,
  PlanningSplitPayload,
  PlanningSplittedInternalPathResponse,
  PlanningSplittedPolygonResponse,
  PlanningTools,
  PlanningUpdatePlanRequest,
  PlanningUpdatePlanResponse,
  Polygon,
  ReorderPathsPayload,
  ReorderPolygonsPayload,
  ScannerTotals,
  ShpFile,
  SubmitPlanPayload,
  UpdatePathNamePayload,
  UpdatePathSettingsPayload,
  Waypoint,
} from 'store/features/planning/types'
import {
  ActionType,
  createAction,
  createAsyncAction,
  createReducer,
  getType,
} from 'typesafe-actions'
import { getRandomColor, getShadesArray, reorderColorArray } from 'utils/colors'
import { MapMode, MapView } from 'utils/myVR/types'
import {
  defaultNeeded,
  emptyUnnamedMultiPathPolygon,
  emptyUnnamedSinglePathPolygon,
  emptyPath,
  getPathTempId,
  getPolygonAutomaticName,
  getPolygonTempId,
  polygonPaths,
  settings,
  waypoints,
  withNewArchs,
  withNewClasses,
  withNewInternalSettings,
  withNewPaths,
  withNewSettings,
  withNewWaypoints,
} from 'utils/planning/polygonHelpers'
import { move } from 'utils/ramda'
import { AnyObject } from 'yup/lib/object'

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>

/**
 * ACTIONS
 */

/** ACTIVATE */
// prettier-ignore
export const planningServiceInitPlanning = createAction('planningService/INIT_PLANNING')<InitPlanningPayload>()
export const toolAction = createAction('planningService/TOOL')<PlanningTools>()
// prettier-ignore
export const initialPointAction = createAction('planningService/INITIAL_POINT')<Waypoint>()
// prettier-ignore
export const finalPointAction = createAction('planningService/FINAL_POINT')<Waypoint>()
// prettier-ignore
export const scannerAction = createAction('planningService/SCANNER')<ScannerTotals | null>()
// prettier-ignore
export const sideCamerasAction = createAction('planningService/SIDE_CAMERAS')<number| null>()
// prettier-ignore
export const mapModeAction = createAction('planningService/MAP_MODE')<MapMode>()
// prettier-ignore
export const rangeDisplayAction = createAction('planningService/RANGE_DISPLAY')<boolean>()
export const undoAction = createAction('planningService/UNDO')()
export const redoAction = createAction('planningService/REDO')()
// prettier-ignore
export const resetPlanAction = createAction('planningService/RESET_PLAN')()
// prettier-ignore
export const clearPlanningHistoryAction = createAction('planningService/CLEAR_HISTORY')()
// prettier-ignore
export const addPolygonAction = createAction('planningService/ADD_POLYGON')<Optional<Omit<Polygon, 'id'>, 'name'>>()
// prettier-ignore
export const deletePolygonAction = createAction('planningService/DELETE_POLYGON')<DeletePolygonActionPayload>()
// prettier-ignore
export const deleteInternalPathAction = createAction('planningService/DELETE_INTERNAL_PATH')<DeleteInternalPathActionPayload>()
// prettier-ignore
export const currentPolygonAction = createAction('planningService/CURRENT_POLYGON')<number>()
// prettier-ignore
export const currentInternalPathAction = createAction('planningService/SELECT_INTERNAL_PATH')<number>()
// prettier-ignore
export const addPointToPolygonAction = createAction('planningService/ADD_POINT_TO_POLYGON')<AddPointToPolygonActionPayload>()
// prettier-ignore
export const addPointAction = createAction('planningService/ADD_POINT')<AddPointActionPayload>()
// prettier-ignore
export const editPointInPolygonAction = createAction('planningService/EDIT_POINT_IN_POLYGON')<EditPointInPolygonActionPayload>()
// prettier-ignore
export const editPointAction=createAction('planningService/EDIT_POINT')<EditPointActionPayload>()
// prettier-ignore
export const deletePlannedPolygonsAction = createAction('planningService/DELETE_PLANNED_POLYGONS')()
// prettier-ignore
export const updatePolygonSettingsAction = createAction('planningService/UPDATE_POLYGON_SETTINGS')<Polygon>()
// prettier-ignore
export const reorderPolygonsAction = createAction('planningService/REORDER_POLYGONS')<ReorderPolygonsPayload>()
// prettier-ignore
export const reorderPathsAction = createAction('planningService/REORDER_PATHS')<ReorderPathsPayload>()
// prettier-ignore
export const updatePolygonNameAction = createAction('planningService/UPDATE_POLYGON_NAME')<Polygon>()
// prettier-ignore
export const updatePathNameAction = createAction('planningService/UPDATE_PATH_NAME')<UpdatePathNamePayload>()
// prettier-ignore
export const updatePathSettingsAction = createAction('planningService/UPDATE_PATH_SETTINGS')<UpdatePathSettingsPayload>()
// prettier-ignore
export const extractPolygonDone = createAction('planningService/EXTRACT_POLYGON_DONE')<ExtractPolygonDone>()
// prettier-ignore
export const importShpDone = createAction('planningService/IMPORT_SHP_DONE')<ImportShpDone>()
// prettier-ignore
export const resetImportedShp = createAction('planningService/RESET_IMPORTED_SHP')()
// prettier-ignore
export const mapViewAction = createAction('planningService/MAP_VIEW')<MapView>()
// prettier-ignore
export const selectOptimisation = createAction('planningService/SELECT_OPTIMISATION')<boolean>()
// prettier-ignore
export const saveProcessingResult = createAction('planningService/SAVE_PROCESSING_RESULT')<JobPlan>()

/** CRUD */
export const submitPlanAction = createAction(
  'planningService/SUBMIT_PLAN'
)<SubmitPlanPayload>()
export const splitActions = createAsyncAction(
  'planningService/SPLIT_REQUEST',
  'planningService/SPLIT_SUCCESS',
  'planningService/SPLIT_FAILURE'
)<PlanningSplitPayload, PlanningSplittedPolygonResponse, undefined>()
export const splitInternalPathActions = createAsyncAction(
  'planningService/SPLIT_INTERNAL_PATH_REQUEST',
  'planningService/SPLIT_INTERNAL_PATH_SUCCESS',
  'planningService/SPLIT_INTERNAL_PATH_FAILURE'
)<
  PlanningSplitInternalPathPayload,
  PlanningSplittedInternalPathResponse,
  undefined
>()
export const getPlannedJobActions = createAsyncAction(
  'planningService/GET_PLANNED_JOB_REQUEST',
  'planningService/GET_PLANNED_JOB_SUCCESS',
  'planningService/GET_PLANNED_JOB_FAILURE'
)<PlanningGetPlanRequest, PlanningGetPlanResponse, Error>()
export const savePlannedJobActions = createAsyncAction(
  'planningService/SAVE_PLANNED_JOB_REQUEST',
  'planningService/SAVE_PLANNED_JOB_SUCCESS',
  'planningService/SAVE_PLANNED_JOB_FAILURE'
)<PlanningSavePlanRequest, PlanningSavePlanResponse, Error>()
export const updatePlannedJobActions = createAsyncAction(
  'planningService/UPDATE_PLANNED_JOB_REQUEST',
  'planningService/UPDATE_PLANNED_JOB_SUCCESS',
  'planningService/UPDATE_PLANNED_JOB_FAILURE'
)<PlanningUpdatePlanRequest, PlanningUpdatePlanResponse, unknown>()
export const deletePlannedJobActions = createAsyncAction(
  'planningService/DELETE_PLANNED_JOB_REQUEST',
  'planningService/DELETE_PLANNED_JOB_SUCCESS',
  'planningService/DELETE_PLANNED_JOB_FAILURE'
)<PlanningDeletePlanRequest, PlanningDeletePlanResponse, undefined>()
export const startProcessingPlanActions = createAsyncAction(
  'planningService/START_PROCESSING_PLAN_REQUEST',
  'planningService/START_PROCESSING_PLAN_SUCCESS',
  'planningService/START_PROCESSING_PLAN_FAILURE'
)<PlanningProcessingStartRequest, PlanningProcessStartResponse, Error>()
export const processingInfoPlanActions = createAsyncAction(
  'planningService/PROCESSING_INFO_PLAN_REQUEST',
  'planningService/PROCESSING_INFO_PLAN_SUCCESS',
  'planningService/PROCESSING_INFO_PLAN_FAILURE'
)<undefined, PlanningProcessInfoResponse, Error>()
export const extractPolygonStartActions = createAsyncAction(
  'planningService/EXTRACT_POLYGON_START_REQUEST',
  'planningService/EXTRACT_POLYGON_START_SUCCESS',
  'planningService/EXTRACT_POLYGON_START_FAILURE'
)<ExtractPolygonStartRequest, ExtractPolygonResponse, undefined>()
export const extractPolygonInfoActions = createAsyncAction(
  'planningService/EXTRACT_POLYGON_INFO_REQUEST',
  'planningService/EXTRACT_POLYGON_INFO_SUCCESS',
  'planningService/EXTRACT_POLYGON_INFO_FAILURE'
)<undefined, ExtractPolygonResponse, undefined>()
export const importShpStartActions = createAsyncAction(
  'planningService/IMPORT_SHP_START_REQUEST',
  'planningService/IMPORT_SHP_START_SUCCESS',
  'planningService/IMPORT_SHP_START_FAILURE'
)<ImportShpStartRequest, ImportShpResponse, undefined>()
export const importShpInfoActions = createAsyncAction(
  'planningService/IMPORT_SHP_INFO_REQUEST',
  'planningService/IMPORT_SHP_INFO_SUCCESS',
  'planningService/IMPORT_SHP_INFO_FAILURE'
)<undefined, ImportShpResponse, undefined>()
export const listShpStartActions = createAsyncAction(
  'planningService/LIST_SHP_START_REQUEST',
  'planningService/LIST_SHP_START_SUCCESS',
  'planningService/LIST_SHP_START_FAILURE'
)<undefined, ListShpResponse, undefined>()
export const listShpInfoActions = createAsyncAction(
  'planningService/LIST_SHP_INFO_REQUEST',
  'planningService/LIST_SHP_INFO_SUCCESS',
  'planningService/LIST_SHP_INFO_FAILURE'
)<undefined, ListShpResponse, undefined>()

const actions = {
  planningServiceInitPlanning,
  toolAction,
  initialPointAction,
  finalPointAction,
  mapModeAction,
  mapViewAction,
  rangeDisplayAction,
  undoAction,
  redoAction,
  addPolygonAction,
  splitActions,
  splitInternalPathActions,
  currentPolygonAction,
  currentInternalPathAction,
  addPointToPolygonAction,
  editPointInPolygonAction,
  updatePolygonSettingsAction,
  updatePolygonNameAction,
  updatePathNameAction,
  updatePathSettingsAction,
  reorderPolygonsAction,
  reorderPathsAction,
  deletePolygonAction,
  deleteInternalPathAction,
  deletePlannedPolygonsAction,
  submitPlanAction,
  resetPlanAction,
  extractPolygonDone,
  importShpDone,
  resetImportedShp,
  getPlannedJobActions,
  savePlannedJobActions,
  updatePlannedJobActions,
  deletePlannedJobActions,
  startProcessingPlanActions,
  processingInfoPlanActions,
  extractPolygonStartActions,
  extractPolygonInfoActions,
  importShpStartActions,
  importShpInfoActions,
  sideCamerasAction,
  scannerAction,
  listShpStartActions,
  listShpInfoActions,
  selectOptimisation,
  saveProcessingResult,
}
export type PlanningAction = ActionType<typeof actions>

/**
 * REDUCERS
 */
type PlanningServiceState = Readonly<{
  tool: PlanningTools
  mapMode: MapMode
  mapView: MapView
  rangeDisplay: boolean
  edited: boolean
  // commented due to PEF-2929
  // optimize: boolean
  polygons: Polygon[]
  initialAlignmentPoint: Waypoint | null
  finalAlignmentPoint: Waypoint | null
  needed: Needed | null
  complete: boolean | null
  warnings: PlanWarning[] | null
  currentPolygonId: number
  currentInternalPathId: number
  processingStatus: ActionStatus
  extractionStatus: ActionStatus
  importShpStatus: ActionStatus
  listShpStatus: ActionStatus
  creationdate: string | null
  updatedate: string | null
  scanner: ScannerTotals | null
  sideCameras: number | null
  polygonNumber: number | null
  shpList: ShpFile[] | null
  shpImported: boolean
  shpFileName: string | null
}>

const initialState: PlanningServiceState = {
  tool: PlanningTools.SELECT,
  mapMode: MapMode.MAP_2D,
  mapView: MapView.THEME,
  rangeDisplay: true,
  edited: false,
  // commented due to PEF-2929
  // optimize: true,
  polygons: [],
  initialAlignmentPoint: null,
  finalAlignmentPoint: null,
  needed: defaultNeeded(),
  complete: null,
  warnings: null,
  currentPolygonId: -1,
  currentInternalPathId: -1,
  processingStatus: null,
  extractionStatus: null,
  importShpStatus: null,
  listShpStatus: null,
  creationdate: null,
  updatedate: null,
  scanner: null,
  sideCameras: null,
  polygonNumber: null,
  shpList: null,
  shpImported: false,
  shpFileName: null,
}

const tool = createReducer(initialState.tool)
  .handleAction(toolAction, (prevState: PlanningTools, { payload }) => payload)
  .handleAction(resetPlanAction, () => initialState.tool)

const shpImported = createReducer(initialState.shpImported)
  .handleAction([importShpStartActions.request], () => false)
  .handleAction(importShpDone, () => true)
  .handleAction(resetImportedShp, () => false)
  .handleAction(resetPlanAction, () => initialState.shpImported)

const shpFileName = createReducer(initialState.shpFileName)
  .handleAction(
    [importShpStartActions.request],
    (prevState: string | null, { payload }) => payload.shpFile
  )
  .handleAction(importShpDone, () => initialState.shpFileName)
  .handleAction(resetImportedShp, () => initialState.shpFileName)
  .handleAction(resetPlanAction, () => initialState.shpFileName)

const currentPolygonId = createReducer(initialState.currentPolygonId)
  .handleAction(
    currentPolygonAction,
    (prevState: number, { payload }) => payload
  )
  .handleAction(resetPlanAction, () => initialState.currentPolygonId)

const currentInternalPathId = createReducer(initialState.currentInternalPathId)
  .handleAction(
    currentInternalPathAction,
    (prevState: number, { payload }) => payload
  )
  .handleAction(
    currentPolygonAction,
    (prevState: number, { payload }) => initialState.currentInternalPathId
  )
  .handleAction(resetPlanAction, () => initialState.currentInternalPathId)

const polygons = createReducer(initialState.polygons)
  .handleAction(addPolygonAction, (prevState: Polygon[], { payload }) => {
    const basePolygon = payload.isPolygon
      ? emptyUnnamedMultiPathPolygon
      : emptyUnnamedSinglePathPolygon
    const avoidColors = prevState.map((p) => p.color || '')
    return [
      ...prevState,
      {
        ...basePolygon,
        ...payload,
        color: payload.color || getRandomColor(avoidColors),
        temp_id: getPolygonTempId(prevState),
        name:
          payload.name || getPolygonAutomaticName(prevState, payload.isPolygon),
      },
    ]
  })
  .handleAction(
    deletePolygonAction,
    (prevState: Polygon[], { payload: { index, name, id } }) => {
      if (!isNil(index)) return remove(index, 1, prevState)
      if (!isNil(name))
        return prevState.filter((polygon) => polygon.name !== name)
      if (!isNil(id))
        return prevState.filter((polygon) => {
          const polygonId = polygon.temp_id || polygon.id
          return polygonId !== id
        })
      return prevState
    }
  )
  .handleAction(
    addPointToPolygonAction,
    (
      prevState: Polygon[],
      { payload: { polygonId, coord, atIndex, arcs: archs } }
    ) => {
      const polygonIndex = prevState.findIndex((t) => {
        const tempPolygonId = t.temp_id || t.id
        return tempPolygonId === polygonId
      })
      if (polygonIndex < 0) return prevState
      const selectedPolygon = { ...prevState[polygonIndex] }
      if (!selectedPolygon) return prevState
      const waypoint: Waypoint = {
        longitude: coord.x,
        latitude: coord.y,
        height: coord.height,
        freePoint: coord.isFreePoint,
      }
      const updatedPolygonWP = withNewWaypoints(
        selectedPolygon,
        isNil(atIndex)
          ? append(waypoint, waypoints(selectedPolygon))
          : insert(atIndex, waypoint, waypoints(selectedPolygon))
      )
      const updatedPolygonArchs = withNewArchs(updatedPolygonWP, archs)
      return update(polygonIndex, updatedPolygonArchs, prevState)
    }
  )
  .handleAction(
    editPointInPolygonAction,
    (
      prevState: Polygon[],
      { payload: { polygonId, coord, atIndex, arcs: archs } }
    ) => {
      const polygonIndex = prevState.findIndex((t) => {
        const tempPolygonId = t.temp_id || t.id
        return tempPolygonId === polygonId
      })
      if (polygonIndex < 0) return prevState
      const selectedPolygon: Polygon = { ...prevState[polygonIndex] }
      if (!coord) return prevState
      if (!selectedPolygon) return prevState
      const waypoint: Waypoint = {
        longitude: coord.x,
        latitude: coord.y,
        height: coord.height,
        freePoint: coord.isFreePoint,
      }
      const updatedPolygonWP = withNewWaypoints(
        selectedPolygon,
        update(atIndex, waypoint, waypoints(selectedPolygon))
      )
      const updatedPolygonArchs = withNewArchs(updatedPolygonWP, archs)
      return update(polygonIndex, updatedPolygonArchs, prevState)
    }
  )
  .handleAction(
    extractPolygonDone,
    (prevState: Polygon[], { payload: { polygonId, paths, classes } }) => {
      const polygonIndex = prevState.findIndex((t) => {
        const tempPolygonId = t.temp_id || t.id
        return tempPolygonId === polygonId
      })
      if (polygonIndex < 0) return prevState
      const selectedPolygon = { ...prevState[polygonIndex] }
      if (!selectedPolygon) return prevState
      const updatedPolygon = pipe(
        (t: Polygon) => withNewPaths(t, paths),
        (t: Polygon) => withNewClasses(t, classes)
      )(selectedPolygon)
      return update(polygonIndex, updatedPolygon, prevState)
    }
  )
  .handleAction(
    [
      getPlannedJobActions.success,
      savePlannedJobActions.success,
      updatePlannedJobActions.success,
    ],
    (prevState: Polygon[], { payload }) => payload.plan.polygons
  )
  .handleAction(
    saveProcessingResult,
    (prevState: Polygon[], { payload }) => payload.polygons || prevState
  )
  .handleAction(
    updatePolygonSettingsAction,
    (prevState: Polygon[], { payload }) => {
      if (!payload.paths) return prevState
      const polygonIndex = prevState.findIndex((t) => {
        const tempPolygonId = t.temp_id || t.id
        const payloadPolygonId = payload.temp_id || payload.id
        return tempPolygonId === payloadPolygonId
      })
      if (polygonIndex < 0) return prevState
      const selectedPolygon = { ...prevState[polygonIndex] }
      const updatedPolygon = withNewSettings(selectedPolygon, settings(payload))
      return update(polygonIndex, updatedPolygon, prevState)
    }
  )
  .handleAction(
    updatePathSettingsAction,
    (prevState: Polygon[], { payload }) => {
      const payloadPolygonId = payload.polygonId
      const polygonIndex = prevState.findIndex((t) => {
        const tempPolygonId = t.temp_id || t.id
        return tempPolygonId === payloadPolygonId
      })
      const selectedPolygon = { ...prevState[polygonIndex] }
      const oldInternalPaths = polygonPaths(selectedPolygon)
      if (!oldInternalPaths) return prevState
      const internalPathIndex = oldInternalPaths.findIndex(
        (gp) => gp.id === payload.path.id
      )
      if (internalPathIndex < 0) return prevState
      const updatedInternalPaths = update(
        internalPathIndex,
        withNewInternalSettings(payload.path, payload.settings),
        oldInternalPaths
      )
      const updatedPolygon = withNewPaths(selectedPolygon, updatedInternalPaths)
      return update(polygonIndex, updatedPolygon, prevState)
    }
  )
  .handleAction(
    updatePolygonNameAction,
    (prevState: Polygon[], { payload }) => {
      const payloadPolygonId = payload.temp_id || payload.id
      const polygonIndex = prevState.findIndex((t) => {
        const tempPolygonId = t.temp_id || t.id
        return tempPolygonId === payloadPolygonId
      })
      if (polygonIndex < 0) return prevState
      const selectedPolygon = { ...prevState[polygonIndex] }
      const updatedPolygon = {
        ...selectedPolygon,
        name: payload.name,
      }
      return update(polygonIndex, updatedPolygon, prevState)
    }
  )
  .handleAction(updatePathNameAction, (prevState: Polygon[], { payload }) => {
    const payloadPolygonId = payload.polygonId
    const polygonIndex = prevState.findIndex((t) => {
      const tempPolygonId = t.temp_id || t.id
      return tempPolygonId === payloadPolygonId
    })
    if (polygonIndex < 0) return prevState
    const selectedPolygon = { ...prevState[polygonIndex] }
    const oldInternalPaths = polygonPaths(selectedPolygon)
    if (!oldInternalPaths) return prevState
    const internalPathIndex = oldInternalPaths.findIndex(
      (gp) => gp.id === payload.path.id
    )
    if (internalPathIndex < 0) return prevState
    const updatedInternalPaths = update(
      internalPathIndex,
      payload.path,
      oldInternalPaths
    )
    const updatedPolygon = withNewPaths(selectedPolygon, updatedInternalPaths)
    return update(polygonIndex, updatedPolygon, prevState)
  })
  .handleAction(
    deleteInternalPathAction,
    (prevState: Polygon[], { payload }) => {
      const payloadPolygonId = payload.polygonId
      const polygonIndex = prevState.findIndex((t) => {
        const tempPolygonId = t.temp_id || t.id
        return tempPolygonId === payloadPolygonId
      })
      if (polygonIndex < 0) return prevState
      const selectedPolygon = { ...prevState[polygonIndex] }
      const oldInternalPaths = polygonPaths(selectedPolygon)
      if (!oldInternalPaths) return prevState
      const internalPathIndex = oldInternalPaths.findIndex(
        (gp) => gp.id === payload.pathId
      )
      if (internalPathIndex < 0) return prevState
      const updatedInternalPaths = remove(
        internalPathIndex,
        1,
        oldInternalPaths
      )
      if (!updatedInternalPaths.length) {
        console.info('[PLANNING] no intenral paths left, removing the polygon')
        return remove(polygonIndex, 1, prevState)
      }
      const updatedPolygon = withNewPaths(selectedPolygon, updatedInternalPaths)
      return update(polygonIndex, updatedPolygon, prevState)
    }
  )
  .handleAction(reorderPolygonsAction, (prevState: Polygon[], { payload }) => {
    return move(payload.fromIndex, payload.toIndex, prevState)
  })
  .handleAction(reorderPathsAction, (prevState: Polygon[], { payload }) => {
    const polygonIndex = prevState.findIndex((t) => {
      const tempPolygonId = t.temp_id || t.id
      return tempPolygonId === payload.polygonId
    })
    const selectedPolygon = { ...prevState[polygonIndex] }
    const updatedInternalPaths = move(
      payload.fromIndex,
      payload.toIndex,
      polygonPaths(selectedPolygon)
    )
    const updatedPolygon = withNewPaths(selectedPolygon, updatedInternalPaths)
    return update(polygonIndex, updatedPolygon, prevState)
  })
  .handleAction(splitActions.success, (prevState: Polygon[], { payload }) => {
    const payloadPolygonId = payload.polygon.temp_id || payload.polygon.id
    const polygonIndex = prevState.findIndex((t) => {
      const tempPolygonId = t.temp_id || t.id
      return tempPolygonId === payloadPolygonId
    })
    const polygonColor = prevState[polygonIndex].color

    const handlePolygonsPath = () => {
      const originalPath = payload.polygon.paths[0]
      const shadesArray = reorderColorArray(
        getShadesArray(polygonColor!),
        originalPath.color!
      )

      const pathIndex = prevState[polygonIndex].paths.findIndex((t) => {
        if (originalPath.id) return t.id === originalPath.id
        return t.name === originalPath.name
      })

      const newPaths = payload.polygons.map((p, i) => {
        /* const random = Math.floor(Math.random() * shadesArray.length) */
        return {
          ...emptyPath,
          ...p.paths[0],
          id: getPathTempId(prevState[polygonIndex].paths) + i,
          name: `${p.paths[0].name} (${i + 1})`,
          color: shadesArray[i % shadesArray.length],
        }
      })

      const newPolygonPaths: Path[] = pipe(
        remove(pathIndex, 1),
        insertAll(pathIndex, newPaths)
      )(prevState[polygonIndex].paths)

      return [
        {
          ...payload.polygon,
          paths: newPolygonPaths,
        },
      ]
    }

    const handleTracks = () => {
      const avoidColors = prevState.map((p) => p.color || '')

      return payload.polygons.map((t, i) => ({
        ...emptyUnnamedSinglePathPolygon,
        ...t,
        temp_id: getPolygonTempId(prevState) + i,
        color: i
          ? getRandomColor(avoidColors)
          : polygonColor || getRandomColor(avoidColors),
        name: `${payload.polygon.name} (${i + 1})`,
      }))
    }

    const newPolygons = payload.polygon.isPolygon
      ? handlePolygonsPath()
      : handleTracks()

    return pipe(
      remove(polygonIndex, 1),
      insertAll(polygonIndex, newPolygons)
    )(prevState)
  })
  .handleAction(importShpDone, (prevState: Polygon[], { payload }) => {
    if (!payload.polygon) return prevState
    return append(payload.polygon, prevState)
  })
  .handleAction(
    splitInternalPathActions.success,
    (prevState: Polygon[], { payload }) => {
      const payloadPolygonId = payload.polygon.temp_id || payload.polygon.id
      const polygonIndex = prevState.findIndex((t) => {
        const tempPolygonId = t.temp_id || t.id
        return tempPolygonId === payloadPolygonId
      })
      // TODO: PLANNING - replace the internals and not the main polygons
      const oldInternalPaths = polygonPaths(prevState[polygonIndex]) || []
      const pathIndex = oldInternalPaths.findIndex((p) => {
        const tempPathId = p.id
        return tempPathId === payload.splitPath.id
      })
      const pathColor = oldInternalPaths[pathIndex].color
      const avoidColors = oldInternalPaths.map((old) => old.color || '')
      const pathsToAdd = payload.splittedPaths.map((p, i) => {
        return mergeDeepRight(p, {
          id: getPathTempId(oldInternalPaths) + i,
          color: i
            ? getRandomColor(avoidColors)
            : pathColor || getRandomColor(avoidColors),
          name: `${payload.splitPath.name} (${i + 1})`,
        })
      })
      const newInternalPaths = pipe(
        remove(pathIndex, 1),
        insertAll(pathIndex, pathsToAdd)
      )(oldInternalPaths)
      const updatedPolygon = withNewPaths(
        prevState[polygonIndex],
        newInternalPaths
      )
      return update(polygonIndex, updatedPolygon, prevState)
    }
  )
  .handleAction(
    [deletePlannedPolygonsAction, resetPlanAction, resetStoreAction],
    (prevState: Polygon[], { type }) => {
      console.info('[PLANNING] reset with action', type)
      return []
    }
  )

/**
 * Makes this slice part undoable
 * see https://github.com/omnidan/redux-undo
 */
const undoablePolygons = undoable(polygons, {
  undoType: getType(undoAction), // define a custom action type for this undo action
  redoType: getType(redoAction), // define a custom action type for this redo action
  clearHistoryType: getType(clearPlanningHistoryAction), // define a custom action type for clearing history
})

const initialAlignmentPoint = createReducer(initialState.initialAlignmentPoint)
  .handleAction(
    getPlannedJobActions.success,
    (prevState: Waypoint | null, { payload }) =>
      payload.plan.initialAlignmentPoint || initialState.initialAlignmentPoint
  )
  .handleAction(
    savePlannedJobActions.success,
    (prevState: Waypoint | null, { payload }) =>
      payload.plan.initialAlignmentPoint || initialState.initialAlignmentPoint
  )
  .handleAction(
    updatePlannedJobActions.success,
    (prevState: Waypoint | null, { payload }) =>
      payload.plan.initialAlignmentPoint || initialState.initialAlignmentPoint
  )
  .handleAction(
    initialPointAction,
    (prevState: Waypoint | null, { payload }) => payload
  )
  .handleAction(resetPlanAction, () => initialState.initialAlignmentPoint)

const finalAlignmentPoint = createReducer(initialState.finalAlignmentPoint)
  .handleAction(
    getPlannedJobActions.success,
    (prevState: Waypoint | null, { payload }) =>
      payload.plan.finalAlignmentPoint || initialState.finalAlignmentPoint
  )
  .handleAction(
    savePlannedJobActions.success,
    (prevState: Waypoint | null, { payload }) =>
      payload.plan.finalAlignmentPoint || initialState.finalAlignmentPoint
  )
  .handleAction(
    updatePlannedJobActions.success,
    (prevState: Waypoint | null, { payload }) =>
      payload.plan.finalAlignmentPoint || initialState.finalAlignmentPoint
  )
  .handleAction(
    finalPointAction,
    (prevState: Waypoint | null, { payload }) => payload
  )
  .handleAction(resetPlanAction, () => initialState.finalAlignmentPoint)

const scanner = createReducer(initialState.scanner)
  .handleAction(
    getPlannedJobActions.success,
    (prevState: ScannerTotals | null, { payload }) =>
      payload.plan.scanner || initialState.scanner
  )
  .handleAction(
    savePlannedJobActions.success,
    (prevState: ScannerTotals | null, { payload }) =>
      payload.plan.scanner || initialState.scanner
  )
  .handleAction(
    updatePlannedJobActions.success,
    (prevState: ScannerTotals | null, { payload }) =>
      payload.plan.scanner || initialState.scanner
  )
  .handleAction(
    scannerAction,
    (prevState: ScannerTotals | null, { payload }) => payload
  )
  .handleAction(
    saveProcessingResult,
    (prevState: ScannerTotals | null, { payload }) =>
      payload.scanner || prevState
  )
  .handleAction(resetPlanAction, () => initialState.scanner)

const sideCameras = createReducer(initialState.sideCameras)
  .handleAction(
    getPlannedJobActions.success,
    (prevState: number | null, { payload }) =>
      !isNil(payload.plan.sideCameras)
        ? payload.plan.sideCameras
        : initialState.sideCameras
  )
  .handleAction(
    savePlannedJobActions.success,
    (prevState: number | null, { payload }) =>
      !isNil(payload.plan.sideCameras)
        ? payload.plan.sideCameras
        : initialState.sideCameras
  )
  .handleAction(
    updatePlannedJobActions.success,
    (prevState: number | null, { payload }) =>
      !isNil(payload.plan.sideCameras)
        ? payload.plan.sideCameras
        : initialState.sideCameras
  )
  .handleAction(saveProcessingResult, (prevState: number | null, { payload }) =>
    !isNil(payload.sideCameras) ? payload.sideCameras : prevState
  )
  .handleAction(
    sideCamerasAction,
    (prevState: number | null, { payload }) => payload
  )
  .handleAction(resetPlanAction, () => initialState.sideCameras)

const edited = createReducer(initialState.edited)
  .handleAction(
    [
      getPlannedJobActions.success,
      savePlannedJobActions.success,
      updatePlannedJobActions.success,
    ],
    (prevState: boolean, { payload }) => false
  )
  .handleAction(
    [
      finalPointAction,
      initialPointAction,
      processingInfoPlanActions.success,
      startProcessingPlanActions.success,
    ],
    (prevState: boolean, { payload }) => true
  )
  .handleAction(resetPlanAction, () => initialState.edited)

// commented due to PEF-2929
// const actionsEnablingOptimize = [
//   addPolygonAction,
//   deletePolygonAction,
//   deleteInternalPathAction,
//   splitActions.success,
//   splitInternalPathActions.success,
//   editPointInPolygonAction,
//   addPointToPolygonAction,
//   extractPolygonStartActions.success,
//   extractPolygonInfoActions.success,
//   extractPolygonDone,
//   deletePlannedPolygonsAction,
//   importShpInfoActions.success,
//   importShpStartActions.success,
//   finalPointAction,
//   initialPointAction,
// ]

// commented due to PEF-2929
// const optimize = createReducer(initialState.optimize)
//   .handleAction(
//     [getPlannedJobActions.success, updatePlannedJobActions.success],
//     (prevState: boolean, { payload }) => !payload.plan.needed
//   )
//   .handleAction([...actionsEnablingOptimize], () => true)
//   .handleAction(
//     [startProcessingPlanActions.success, processingInfoPlanActions.success],
//     () => false
//   )
//   .handleAction(resetPlanAction, () => initialState.optimize)
// // TODO: we could clean this with the selector like the edited state

const needed = createReducer(initialState.needed)
  .handleAction(
    [
      getPlannedJobActions.success,
      savePlannedJobActions.success,
      updatePlannedJobActions.success,
    ],
    (prevState: Needed | null, { payload }) =>
      payload.plan.needed || initialState.needed
  )
  .handleAction(
    processingInfoPlanActions.success,
    (prevState: Needed | null, { payload }) =>
      payload.result?.plan?.needed || initialState.needed
  )
  .handleAction(
    saveProcessingResult,
    (prevState: Needed | null, { payload }) =>
      payload.needed || initialState.needed
  )
  .handleAction(
    [
      // ...actionsEnablingOptimize,
      deletePolygonAction,
      deleteInternalPathAction,
      splitActions.success,
      splitInternalPathActions.success,
      editPointInPolygonAction,
      addPointToPolygonAction,
      //extractPolygonStartActions.success,
      //extractPolygonInfoActions.success,
      //extractPolygonDone,
      deletePlannedPolygonsAction,
      importShpInfoActions.success,
      importShpStartActions.success,
      finalPointAction,
      initialPointAction,
      addPolygonAction,
      updatePolygonSettingsAction,
      reorderPathsAction,
      updatePathSettingsAction,
      initialPointAction,
      finalPointAction,
      reorderPolygonsAction,
      scannerAction,
      sideCamerasAction,
    ],
    (prevState: Needed | null) => initialState.needed
  )
  .handleAction(resetPlanAction, () => initialState.needed)

const creationDate = createReducer(initialState.creationdate)
  .handleAction(
    getPlannedJobActions.success,
    (prevState: string | null, { payload }) =>
      isNil(payload.plan.creationDate)
        ? initialState.creationdate
        : payload.plan.creationDate
  )
  .handleAction(
    savePlannedJobActions.success,
    (prevState: string | null, { payload }) =>
      isNil(payload.plan.creationDate)
        ? initialState.creationdate
        : payload.plan.creationDate
  )
  .handleAction(
    updatePlannedJobActions.success,
    (prevState: string | null, { payload }) =>
      isNil(payload.plan.creationDate)
        ? initialState.creationdate
        : payload.plan.creationDate
  )
  .handleAction(resetPlanAction, () => initialState.creationdate)

const updateDate = createReducer(initialState.updatedate)
  .handleAction(
    getPlannedJobActions.success,
    (prevState: string | null, { payload }) =>
      isNil(payload.plan.updateDate)
        ? initialState.updatedate
        : payload.plan.updateDate
  )
  .handleAction(
    savePlannedJobActions.success,
    (prevState: string | null, { payload }) =>
      isNil(payload.plan.updateDate)
        ? initialState.updatedate
        : payload.plan.updateDate
  )
  .handleAction(
    updatePlannedJobActions.success,
    (prevState: string | null, { payload }) =>
      isNil(payload.plan.updateDate)
        ? initialState.updatedate
        : payload.plan.updateDate
  )
  .handleAction(resetPlanAction, () => initialState.updatedate)

const warnings = createReducer(initialState.warnings)
  .handleAction(
    savePlannedJobActions.success,
    (prevState: PlanWarning[] | null, { payload }) =>
      payload.warnings || initialState.warnings
  )
  .handleAction(
    updatePlannedJobActions.success,
    (prevState: PlanWarning[] | null, { payload }) =>
      payload.warnings || initialState.warnings
  )
  .handleAction(resetPlanAction, () => initialState.warnings)

const processingStatus = createReducer(initialState.processingStatus)
  .handleAction(
    [startProcessingPlanActions.success, processingInfoPlanActions.success],
    (prevState: ActionStatus, { payload }) => payload.action.status
  )
  .handleAction(
    [
      resetPlanAction,
      processingInfoPlanActions.failure,
      startProcessingPlanActions.failure,
    ],
    () => initialState.processingStatus
  )

const extractionStatus = createReducer(initialState.extractionStatus)
  .handleAction(
    [extractPolygonStartActions.success, extractPolygonInfoActions.success],
    (prevState: ActionStatus, { payload }) => payload.action.status
  )
  .handleAction(resetPlanAction, () => initialState.extractionStatus)

const importShpStatus = createReducer(initialState.importShpStatus)
  .handleAction(
    [importShpStartActions.success, importShpInfoActions.success],
    (prevState: ActionStatus, { payload }) => payload.action.status
  )
  .handleAction(resetPlanAction, () => initialState.importShpStatus)

const listShpStatus = createReducer(initialState.listShpStatus)
  .handleAction(
    [listShpStartActions.success, listShpInfoActions.success],
    (prevState: ActionStatus, { payload }) => payload.action.status
  )
  .handleAction(resetPlanAction, () => initialState.importShpStatus)

const rangeDisplay = createReducer(initialState.rangeDisplay)
  .handleAction(
    rangeDisplayAction,
    (prevState: boolean, { payload }) => payload
  )
  .handleAction(resetPlanAction, () => initialState.rangeDisplay)

const mapMode = createReducer(initialState.mapMode)
  .handleAction(mapModeAction, (prevState: MapMode, { payload }) => payload)
  .handleAction(resetPlanAction, () => initialState.mapMode)

const mapView = createReducer(initialState.mapView)
  .handleAction(mapViewAction, (prevState: MapView, { payload }) => payload)
  .handleAction(resetPlanAction, () => initialState.mapView)

const polygonNumber = createReducer(initialState.polygonNumber)
  .handleAction(
    getPlannedJobActions.success,
    (prevState: number | null, { payload }) => payload.plan.polygons.length
  )
  .handleAction(resetPlanAction, () => initialState.polygonNumber)

const shpList = createReducer(initialState.shpList)
  .handleAction(listShpStartActions.request, () => null)
  .handleAction(
    [listShpStartActions.success, listShpInfoActions.success],
    (prevState: ShpFile[] | null, { payload }) => {
      if (payload.action.status === 'error') return []
      return payload.result?.shpList || prevState
    }
  )
  .handleAction(
    [listShpStartActions.failure, listShpInfoActions.failure],
    () => []
  )
  .handleAction(resetPlanAction, () => initialState.shpList)

export const planningServiceReducer = combineReducers({
  tool,
  undoablePolygons,
  edited,
  // commented due to PEF-2929
  // optimize,
  initialAlignmentPoint,
  finalAlignmentPoint,
  needed,
  creationDate,
  updateDate,
  warnings,
  currentPolygonId,
  currentInternalPathId,
  processingStatus,
  extractionStatus,
  importShpStatus,
  listShpStatus,
  rangeDisplay,
  mapMode,
  mapView,
  scanner,
  sideCameras,
  polygonNumber,
  shpList,
  shpImported,
  shpFileName,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      planningService: PlanningServiceState & {
        undoablePolygons: ReturnType<typeof undoablePolygons>
      }
    }
  | AnyObject
export const selectPlanningServiceState = (
  state: OptimizedRootState
): PlanningServiceState & {
  undoablePolygons: ReturnType<typeof undoablePolygons>
} => state.planningService

export const selectShpImported = (state: OptimizedRootState) =>
  selectPlanningServiceState(state).shpImported

export const selectShpFileName = (state: OptimizedRootState) =>
  selectPlanningServiceState(state).shpFileName

export const selectTool = (state: OptimizedRootState) =>
  selectPlanningServiceState(state).tool

export const selectPolygons = (state: OptimizedRootState): Polygon[] =>
  selectPlanningServiceState(state).undoablePolygons.present

export const selectinitialAlignmentPoint = (state: OptimizedRootState) =>
  selectPlanningServiceState(state).initialAlignmentPoint

export const selectFinalAlignmentPoint = (state: OptimizedRootState) =>
  selectPlanningServiceState(state).finalAlignmentPoint

export const selectPlanScanner = (state: OptimizedRootState) =>
  selectPlanningServiceState(state).scanner

export const selectPlanSideCameras = (state: OptimizedRootState) =>
  selectPlanningServiceState(state).sideCameras

export const selectNeeded = (state: OptimizedRootState) =>
  selectPlanningServiceState(state).needed

export const selectPlanComplete = (state: OptimizedRootState): boolean => {
  const currentNeeded = selectPlanningServiceState(state).needed
  if (!currentNeeded) return false
  if (!currentNeeded.time) return false
  if (!Number(currentNeeded.time)) return false
  return !equals(currentNeeded, defaultNeeded())
}

export const selectPlanCreationDate = (state: OptimizedRootState) =>
  selectPlanningServiceState(state).creationdate

export const selectPlanUpdateDate = (state: OptimizedRootState) =>
  selectPlanningServiceState(state).updatedate

export const selectPlanWarnings = (state: OptimizedRootState) =>
  selectPlanningServiceState(state).warnings

export const selectUndoAvailable = (state: OptimizedRootState): boolean =>
  selectPlanningServiceState(state).undoablePolygons.past.length > 0

export const selectRedoAvailable = (state: OptimizedRootState): boolean =>
  selectPlanningServiceState(state).undoablePolygons.future.length > 0

export const selectCurrentPolygonId = (state: OptimizedRootState) =>
  selectPlanningServiceState(state).currentPolygonId

export const selectcurrentInternalPathId = (state: OptimizedRootState) =>
  selectPlanningServiceState(state).currentInternalPathId

export const selectCurrentPolygon = (state: OptimizedRootState) =>
  selectPolygons(state).find((t) => {
    const tempPolygonId = t.temp_id || t.id
    return tempPolygonId === state.planningService.currentPolygonId
  })

export const selectProcessingStatus = createSelector(
  selectPlanningServiceState,
  (data) => data.processingStatus
)

export const selectExtractionStatus = createSelector(
  selectPlanningServiceState,
  (data) => data.extractionStatus
)

export const selectImportShpStatus = createSelector(
  selectPlanningServiceState,
  (data) => data.importShpStatus
)

export const selectListShpStatus = createSelector(
  selectPlanningServiceState,
  (data) => data.listShpStatus
)

export const selectShpList = createSelector(
  selectPlanningServiceState,
  (data) => data.shpList
)

export const selectRangeDisplay = (state: OptimizedRootState) =>
  selectPlanningServiceState(state).rangeDisplay

export const selectMapMode = (state: OptimizedRootState) =>
  selectPlanningServiceState(state).mapMode

export const selectEditedStatus = (state: OptimizedRootState): boolean =>
  selectPlanningServiceState(state).undoablePolygons.past.length > 0 ||
  selectPlanningServiceState(state).edited

// commented due to PEF-2929
// export const selectOptimizePolygons = (state: OptimizedRootState): boolean =>
//   selectPlanningServiceState(state).optimize

export const selectMapView = (state: OptimizedRootState) =>
  selectPlanningServiceState(state).mapView

export const selectPolygonNumber = (state: OptimizedRootState) =>
  selectPlanningServiceState(state).polygonNumber
