import { t } from 'i18n/config'
import {
  always,
  cond,
  curry,
  DeepPartial,
  equals,
  head,
  last,
  lensPath,
  map,
  mergeDeepRight,
  pipe,
  prop,
  set,
  T,
  takeLast,
  uniq,
  unnest,
  view,
} from 'ramda'
import {
  Arch,
  isGeometryPath,
  isPolygon,
  Needed,
  Path,
  PathCollectionMode,
  PathSettings,
  Polygon,
  Ramps,
  RawCoordinate,
  Waypoint,
} from 'store/features/planning/types'
import { rawToWP, wpToRaw } from 'utils/planning/typeConversions'

export function waypoints(polygon: Polygon | undefined | null): Waypoint[] {
  if (!polygon) return []
  if (polygon.isPolygon) return rawToWP(polygon.coordinates || [])
  return polygon.paths[0]?.waypoints || []
}

export function arcs(
  polygon: (Partial<Polygon> & { paths: Path[] }) | Path | undefined | null
): Arch[] {
  if (!polygon) return []
  if (isGeometryPath(polygon)) {
    return polygon.arcs || []
  }
  if (polygon.isPolygon) return []
  if (!polygon.paths) return []
  if (polygon.paths.length === 1) return polygon.paths[0]?.arcs || []
  return pipe(
    map((p: Path) => prop('arcs', p)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (arr: any) => unnest(arr)
  )(polygon.paths) as Arch[]
}

export function settings(
  polygon: Polygon | Path | undefined
): PathSettings | null {
  if (!polygon) return null
  if (!isPolygon(polygon)) {
    return polygon.settings || null
  }
  if (polygon.isPolygon) return null
  return polygon.paths[0]?.settings || null
}

/* export function complete(polygon: Polygon | undefined): boolean {
  if (!polygon) return false
  // TODO: PLANNING - handle polygon completeness. same as path but check all, not only the first one. Can be unified at this point
  if (polygon.isPolygon) return false
  return !!polygon.paths[0]?.completed
} */

export function complete(polygon: Polygon | undefined): boolean {
  if (!polygon) return false
  if (polygon.isPolygon) {
    return polygon.paths.every((p) => p.completed === 100)
  }
  return polygon.paths[0]?.completed === 100
}

export function coveredPolygon(
  polygon: Polygon | undefined
): Polygon | undefined {
  if (!polygon) return undefined
  if (polygon.isPolygon) {
    const coveredPaths = polygon.paths.filter((p) => p.completed === 100)
    if (coveredPaths.length === 0) return undefined
    return {
      ...polygon,
      // to avoid problems while reordering
      id: polygon.id! + 0.1,
      paths: coveredPaths,
    }
  }
  return complete(polygon) ? polygon : undefined
}

export function uncoveredPolygon(
  polygon: Polygon | undefined
): Polygon | undefined {
  if (!polygon) return undefined
  if (polygon.isPolygon) {
    const uncoveredPaths = polygon.paths.filter((p) => p.completed !== 100)
    if (uncoveredPaths.length === 0) return undefined
    return {
      ...polygon,
      paths: uncoveredPaths,
    }
  }
  return !complete(polygon) ? polygon : undefined
}

export function name(polygon: Polygon | Path | undefined): string | null {
  if (!polygon) return null
  if (!isPolygon(polygon)) {
    return polygon.name || null
  }
  if (polygon.isPolygon) return null
  return polygon.name || null
}

export function color(polygon: Polygon | Path | undefined): string | null {
  if (!polygon) return null
  if (!isPolygon(polygon)) {
    return polygon.color || null
  }
  if (polygon.isPolygon) return null
  return polygon.color || null
}

export function polygonPaths(polygon: Polygon | undefined): Path[] | null {
  if (!polygon) return null
  // if (!polygon.isPolygon) return null
  return polygon.paths || null
}

export function withNewSettings(
  polygon: Polygon,
  newSettings?: PathSettings | null
): Polygon {
  if (!newSettings) return polygon
  const propLens = lensPath(['paths'])
  const paths: Path[] = view(propLens, polygon) as Path[]
  const updatedPath = {
    ...paths[0],
    settings: newSettings,
  }
  const updatedPolygon = set(propLens, [updatedPath], polygon) as Polygon
  return updatedPolygon
}

export function withNewInternalSettings(
  path: Path,
  newSettings?: PathSettings | null
): Path {
  if (!newSettings) return path
  const updatedPath = {
    ...path,
    settings: newSettings,
  }
  return updatedPath
}

export function withNewWaypoints(
  polygon: Polygon,
  newWaypoints: Waypoint[]
): Polygon {
  const values = polygon.isPolygon ? wpToRaw(newWaypoints) : newWaypoints
  if (polygon.isPolygon) {
    const propLens = lensPath(['coordinates'])
    return set(propLens, values, polygon) as Polygon
  }
  const propLens = lensPath(['paths'])
  const paths: Path[] = view(propLens, polygon) as Path[]
  const updatedPath = {
    ...paths[0],
    waypoints: values,
  }
  const updatedPolygon = set(propLens, [updatedPath], polygon) as Polygon
  return updatedPolygon
}

export function withNewArchs(polygon: Polygon, newArcs?: Arch[]): Polygon {
  if (!newArcs) return polygon
  const propLens = lensPath(['paths'])
  const paths: Path[] = view(propLens, polygon) as Path[]
  const updatedPath = {
    ...paths[0],
    arcs: newArcs,
  }
  const updatedPolygon = set(propLens, [updatedPath], polygon) as Polygon
  return updatedPolygon
}

export function withNewPaths(
  polygon: Polygon,
  newInternalPaths?: Path[]
): Polygon {
  if (!newInternalPaths) return polygon
  const propLens = lensPath(['paths'])
  return set(propLens, newInternalPaths, polygon) as Polygon
}

export function withNewClasses(polygon: Polygon, classes: string[]): Polygon {
  const propLens = lensPath(['classes'])
  return set(propLens, classes, polygon) as Polygon
}

// not needed anymore
export function withPolygonDetection(polygon: Polygon): Polygon {
  return { ...polygon, isPolygon: !!polygon.coordinates?.length }
}

export function defaultSettings(): PathSettings {
  return {
    camera: { enable: 1, distance: 5, elapse: 250 },
    collection: {
      multiple: false,
    },
    drivingSpeed: 45,
    scanner: {
      range: 150,
      scanlineSpacing: 5,
    },
  }
}

export function mergeJobSettings(
  original: PathSettings,
  override?: IJob | null
): PathSettings {
  const jobSettings: DeepPartial<PathSettings> = override
    ? {
        camera: {
          enable: override.camera?.enable,
          distance: override.camera?.distance,
        },
        drivingSpeed: override.drivingspeed,
        scanner: {
          range: override.scanner?.range,
          scanlineSpacing: override.scanner?.scanlinespacing,
        },
        collection:
          override.collectionmode === PathCollectionMode.ONEWAY
            ? { multiple: false }
            : { multiple: true, forward: 1, backward: 1 },
      }
    : {}
  return mergeDeepRight(original, jobSettings) as PathSettings
}

export function emptyPolygonSinglePath(
  polygonName?: string,
  currentJob?: IJob | null
): Polygon {
  const mergedSettings = mergeJobSettings(defaultSettings(), currentJob)
  return {
    name: polygonName || 'EmptyPolygonSinglePath',
    coordinates: [],
    paths: [
      {
        waypoints: [],
        settings: mergedSettings,
      },
    ],
    isPolygon: false,
  }
}

export function emptyPolygon(polygonName?: string): Polygon {
  return {
    name: polygonName || 'EmptyPolygon',
    coordinates: [],
    paths: [],
    isPolygon: true,
  }
}

export const emptyUnnamedSinglePathPolygon: Partial<Polygon> = {
  ...emptyPolygonSinglePath(''),
  name: undefined,
}
export const emptyUnnamedMultiPathPolygon: Partial<Polygon> = {
  ...emptyPolygon(''),
  name: undefined,
}

export const emptyPath: Partial<Path> = {
  waypoints: [],
  arcs: [],
  settings: defaultSettings(),
}

export function defaultNeeded(): Needed {
  return {
    time: null,
    battery: null,
    disk: null,
    distance: null,
  }
}

export function onlyWithEnoughPoints(polygons: Polygon[]): Polygon[] {
  return polygons.filter((p) => {
    const wp = waypoints(p) // works for polygons too, in that case checks for coordinates internally
    return wp.length > 1
  })
}

export const getPolygonTempId = (tracks: Polygon[]): number => {
  const maxId = tracks.reduce(
    (stack, tr) => Math.max(Math.max(tr.temp_id || 0, stack), tr.id || 0),
    0
  )
  return maxId ? maxId + 1 : 1
}

export const getPathTempId = (paths: Path[]): number => {
  const maxId = paths.reduce(
    (stack, p) => Math.max(Math.max(p.id || 0, stack), p.id || 0),
    0
  )
  return maxId ? maxId + 1 : 1
}

export const getTrackBaseName = (baseNumber: number, polygon?: boolean) => {
  const numericPart = takeLast(3, `00${baseNumber}`)
  const baseName = polygon
    ? t('planning.defaultNames.polygon', 'polygon')
    : t('planning.defaultNames.track', 'track')
  return `${baseName}${numericPart}`
}

export const getPolygonAutomaticName = (
  tracks: Polygon[],
  polygon?: boolean,
  add?: number
): string => {
  const filtered = tracks.filter((tr) => {
    if (polygon) return !!tr.isPolygon
    return !tr.isPolygon
  })
  const baseNumber = filtered.length + (add || 0) + 1
  return getTrackBaseName(baseNumber, polygon)
}

const classesThatSupportRamps = [
  'motorway',
  'truck',
  'primary',
  'secondary',
  'tertiary',
]

export const addRampsInfo = curry((ramps: Ramps, cls: string): string[] => {
  if (!classesThatSupportRamps.includes(cls)) return [cls]
  return cond([
    [equals('include_ramps'), always([cls, `${cls}ramps`])],
    [equals('only_ramps'), always([`${cls}ramps`])],
    [T, always([`${cls}`])],
  ])(ramps)
})

export const stripRamps = (clss?: string[]): string[] =>
  clss ? uniq(clss.map((cls) => cls.replace('ramps', ''))) : []

export const getRampsSetting = ({ classes }: Polygon): Ramps | null => {
  if (!classes) return null
  const classesWithRamps = classes.filter((cls) => cls.indexOf('ramps') > 0)
  if (!classesWithRamps.length) return 'no_ramps'
  const classWithNoRamp = classesWithRamps[0].replace('ramps', '')
  if (classes.includes(classWithNoRamp)) return 'include_ramps'
  return 'only_ramps'
}

export const sanitizeShpPolygons = (
  polygons: Polygon[] | undefined
): Polygon[] | undefined => {
  if (!polygons) return undefined
  // Here we avoided Ramda as an optimization for large shp files.
  // Ramda creates always new objects so it can increase memory usage significantly
  // if the data is big
  return polygons.map((pol) => {
    // eslint-disable-next-line no-param-reassign
    pol.paths.map((path) => {
      if (!path.waypoints) return []
      const firstWP = head(path.waypoints) as Waypoint
      const lastWP = last(path.waypoints) as Waypoint
      // eslint-disable-next-line no-param-reassign
      path.waypoints = [firstWP, lastWP]
      return path
    })
    return pol
  })
}

export const noUndefined = (n: number | undefined) => n !== undefined

export const invertCoordinates = (raw: RawCoordinate) => [
  raw[1],
  raw[0],
  raw[2],
]

export const getPolygonCoordinatesFromPaths = (
  paths: Path[]
): RawCoordinate[] => {
  const pathArcs = unnest(paths.map((p) => p.arcs)) as unknown as Arch[]
  const arcsCoordinates = unnest(pathArcs.map((a) => a?.coordinates)) as (
    | RawCoordinate
    | undefined
  )[]
  const left =
    arcsCoordinates.reduce(
      (stack: number | undefined, coord: RawCoordinate | undefined) => {
        if (!coord) return stack
        if (!stack) return coord[0]
        if (coord[0] < stack) return coord[0]
        return stack
      },
      undefined
    ) || 0
  const right =
    arcsCoordinates.reduce(
      (stack: number | undefined, coord: RawCoordinate | undefined) => {
        if (!coord) return stack
        if (!stack) return coord[0]
        if (coord[0] > stack) return coord[0]
        return stack
      },
      undefined
    ) || 0
  const top =
    arcsCoordinates.reduce(
      (stack: number | undefined, coord: RawCoordinate | undefined) => {
        if (!coord) return stack
        if (!stack) return coord[1]
        if (coord[1] < stack) return coord[1]
        return stack
      },
      undefined
    ) || 0
  const bottom =
    arcsCoordinates.reduce(
      (stack: number | undefined, coord: RawCoordinate | undefined) => {
        if (!coord) return stack
        if (!stack) return coord[1]
        if (coord[1] > stack) return coord[1]
        return stack
      },
      undefined
    ) || 0
  const outCoordinates = [
    [top, left, 0],
    [top, right, 0],
    [bottom, right, 0],
    [bottom, left, 0],
  ]
  return outCoordinates
}

export const getPolygonStyleName = (
  polygonColor: string | null,
  isMultipathPolygon: boolean,
  isSelected: boolean
) => {
  const selectedStyle = isSelected || isMultipathPolygon ? '' : '-notselected'
  const polygonStyle = isMultipathPolygon ? 'polygon-' : ''
  return `${polygonStyle}color-${polygonColor}${selectedStyle}`
}
