import { ActionStatus, ActionError } from 'store/features/actions/types'
import { PlanningNotificationCode } from 'store/features/system/notifications/notificationCodes'

/**
 * TYPES
 */
export enum SaveLocation {
  DEFAULT = 'default',
  CURRENT_DISK = 'currentDisk',
  WHERE_SPACE_AVAILABLE = 'whereSpaceAvailable',
}
export enum PlanningTools {
  DRAW_PATH = 'DRAW_PATH',
  DRAW_POLYGON = 'DRAW_POLYGON',
  DELETE_POLYGON = 'DELETE_POLYGON',
  DELETE_PATH = 'DELETE_PATH',
  CUT = 'CUT',
  CUT_INTERNAL = 'CUT_INTERNAL',
  MOVE_POINT = 'MOVE_POINT',
  SELECT = 'SELECT',
  SELECT_INTERNAL = 'SELECT_INTERNAL',
  INITIAL_POINT = 'INITIAL_POINT',
  FINAL_POINT = 'FINAL_POINT',
  IMPORT_SHP = 'IMPORT_SHP',
  LIST_SHP = 'LIST_SHP',
}
export enum PlanningActions {
  UNDO = 'UNDO',
  REDO = 'REDO',
}
export type PlanWarning = {
  code: PlanningNotificationCode
  description: string
  p1?: string
  p2?: string
  p3?: string
}

export type Coord3D = {
  x: number
  y: number
}

export type Coord3DPlanning = Coord3D & {
  height?: number
  isFreePoint: boolean
}

export type Waypoint = {
  longitude: number
  latitude: number
  height?: number
  freePoint: boolean
}

export enum PathCollectionMode {
  ONEWAY = 'oneway',
  BOTHWAYS = 'bothways',
  // OTHER = 'other',
}

export type CameraSettings = {
  enable: 0 | 1 | 2
  distance: number
  elapse: number
  blur?: boolean
}

export type CollectionSettings = {
  forceDirection?: boolean
  multiple: boolean
  forward?: number
  backward?: number
}

export type ScannerSettings = {
  scanlineSpacing: number
  range: number
}

export type PathSettings = {
  camera: CameraSettings
  collection: CollectionSettings
  drivingSpeed?: number
  scanner: ScannerSettings
}

export type Ramps = 'include_ramps' | 'no_ramps' | 'only_ramps'

export type Polygon = {
  id?: number
  temp_id?: number
  name?: string
  color?: string
  classes?: string[]
  isPolygon?: boolean // needs to be evaluated since it's not coming from the backend
  coordinates: RawCoordinate[]
  paths: Path[]
  disabled?: boolean
}

export type PlanningObject = Polygon | Path

export type PathType = 0 | 1 | 2
export type Path = {
  id?: number
  type?: PathType
  waypoints?: Waypoint[]
  arcs?: Arch[]
  settings?: PathSettings
  completed?: number
  color?: string
  name?: string
  disabled?: boolean
}

export type Arch = {
  length: number
  coordinates: RawCoordinate[]
  completed?: boolean
  speedLimit?: number
}

export type RawCoordinate = number[]

export type Needed = {
  time: number | null
  disk: number | null
  battery: number | null
  distance: number | null
}

export type FullNeeded = Needed & {
  time: number
  disk: number
  distance: number
}

export type ScannerTotals = {
  numZF?: number
  numVelodyne?: number
  numOptech?: number
  numHesai?: number
}

export type InitPlanningPayload = {
  disk: string
  project: string
  job: string
}

export type JobPlan = {
  /**
   * coordinates for the initial alignment
   */
  initialAlignmentPoint?: Waypoint
  /**
   * coordinates for the final alignment
   */
  finalAlignmentPoint?: Waypoint
  /**
   * planned polygons
   */
  polygons: Polygon[]
  /**
   * plan estimations
   */
  needed?: Needed
  /**
   * Creation date of the project (eg. 2021-05-18T16:02:16Z)
   */
  creationDate?: string
  /**
   * Last update date of the project (eg. 2021-05-18T16:02:16Z)
   */
  updateDate?: string
  /**
   * SU Scanners
   */
  scanner?: ScannerTotals | null
  /**
   * SU SideCameras
   */
  sideCameras?: number | null
}

export type AddPointActionPayload = {
  atIndex?: number
  coord: Coord3DPlanning
}

export type AddPointToPolygonActionPayload = {
  atIndex?: number
  polygonId: number
  coord: Coord3DPlanning
  arcs?: Arch[]
}

export type EditPointActionPayload = AddPointActionPayload & {
  atIndex: number
}

export type EditPointInPolygonActionPayload = AddPointToPolygonActionPayload & {
  atIndex: number
}

export type ReorderPolygonsPayload = {
  fromIndex: number
  toIndex: number
}

export type ReorderPathsPayload = ReorderPolygonsPayload & {
  polygonId: number
}

export type PlanningPathResponse = {
  polygons: Polygon[]
}

export type PlanningNearestPointResponse = {
  latitude: number
  longitude: number
  distance: number
}

export type DeletePolygonActionPayload = {
  name?: string
  id?: number
  index?: number
}

export type DeleteInternalPathActionPayload = {
  polygonId: number
  pathId: number
}

export type PlanningGetPlanRequest = {
  disk: string
  project: string
  job: string
}
export type PlanningGetPlanResponse = {
  plan: JobPlan
  disk?: string
  project?: string
  job?: string
}

export type PlanningDeletePlanRequest = PlanningGetPlanRequest & {}
export type PlanningDeletePlanResponse = {}

export type PlanningSavePlanRequest = {
  disk: string
  project: string
  job: string
  plan: JobPlan
  saveLocation?: SaveLocation
}
export type PlanningSavePlanResponse = {
  plan: JobPlan
  project?: string
  disk?: string
  /**
   * array of error codes to be translated
   */
  warnings?: PlanWarning[]
}

export type PlanningUpdatePlanRequest = PlanningSavePlanRequest & {}
export type PlanningUpdatePlanResponse = PlanningSavePlanResponse & {}

export type PlanningAction = {
  status: ActionStatus
  progress: number
  description: string
  errors?: ActionError[]
}
export type PlanningProcessingStartRequest = {
  project: string
  job: string
  disk: string
  optimize: boolean
  plan: JobPlan
}
export type PlanningProcessStartResponse = {
  action: PlanningAction
  result?: {
    plan: JobPlan
  }
}
export type PlanningProcessInfoResponse = PlanningProcessStartResponse & {}

export type PlanningSplitPayload = {
  splitPoint: Waypoint
}
export type PlanningSplitRequest = PlanningSplitPayload & {
  splitPolygon: number
  splitPath: number
  polygons: Polygon[]
}
export type PlanningSplitResponse = {
  polygons: Polygon[]
}
export type PlanningSplittedPolygonResponse = {
  polygon: Polygon
  polygons: Polygon[]
}

export type PlanningSplitInternalPathPayload = PlanningSplitPayload & {}
export type PlanningSplitInternalPathRequest = PlanningSplitRequest & {}
export type PlanningSplitInternalPathResponse = PlanningSplitResponse & {}
export type PlanningSplittedInternalPathResponse = {
  polygon: Polygon
  splitPath: Path
  splittedPaths: Path[]
}

export type SubmitPlanPayload = {
  process: boolean
  save: boolean
  activate: boolean
  optimize?: boolean
}

export type ExtractPolygonStartRequest = {
  coordinates: RawCoordinate[]
  classes: string[]
}

export type ExtractPolygonResponse = {
  action: {
    status: ActionStatus
    progress: number
    description: string
    errors?: ActionError[]
  }
  result: {
    polygons: Polygon[]
  }
}

export type ExtractPolygonDone = {
  polygonId: number
  paths: Path[]
  classes: string[]
}

export type ImportShpStartRequest = {
  shpFile: string
}

export type ImportShpResponse = {
  action: {
    status: ActionStatus
    progress: number
    description: string
    errors?: ActionError[]
  }
  result?: {
    polygons: Polygon[]
  }
}

export type ImportShpDone = {
  polygon?: Polygon
}

export type ShpFile = {
  path: string
  filename: string
  lastEditDate: string
}

export type ListShpResponse = {
  action: {
    status: ActionStatus
    progress: number
    description: string
    errors?: ActionError[]
  }
  result?: {
    shpList: ShpFile[]
  }
}

export type ListShpDone = ShpFile[] | null

export type UpdatePathNamePayload = {
  path: Path
  polygonId: number
}

export type UpdatePathSettingsPayload = {
  path: Path
  settings: PathSettings
  polygonId: number
}

export function isPolygon(obj: Path | Polygon): obj is Polygon {
  return (obj as Polygon).paths !== undefined
}

export function isGeometryPath(obj: Path | unknown): obj is Path {
  return (obj as Path).arcs !== undefined
}
