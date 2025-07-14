import { isNil } from 'ramda'
import {
  Coord3D,
  Coord3DPlanning,
  Arch,
  Polygon,
  RawCoordinate,
  Waypoint,
} from 'store/features/planning/types'

export function wpToPos3D(wps: Waypoint[] | undefined): Position3D[] {
  if (!wps) return []
  return wps.map((wp) => ({
    x: wp.longitude,
    y: wp.latitude,
    z: wp.height,
  }))
}

export function wpToCoord3D(wps: Waypoint[] | undefined): Coord3D[] {
  if (!wps) return []
  return wps.map((wp) => ({
    x: wp.longitude,
    y: wp.latitude,
    z: wp.height,
  }))
}

export function wpToCoord3DPln(wps: Waypoint[] | undefined): Coord3DPlanning[] {
  if (!wps) return []
  return wps.map((wp) => ({
    x: wp.longitude,
    y: wp.latitude,
    height: wp.height,
    isFreePoint: wp.freePoint,
  }))
}

export function coord3DPlnToWp(
  coords: Coord3DPlanning[] | undefined
): Waypoint[] {
  if (!coords) return []
  return coords.map((coord) => ({
    latitude: coord.y,
    longitude: coord.x,
    height: coord.height,
    freePoint: coord.isFreePoint,
  }))
}

export function rawToWP(raws: RawCoordinate[] | undefined): Waypoint[] {
  if (!raws) return []
  return raws.map((r) => ({
    longitude: r[0],
    latitude: r[1],
    height: r[2],
    freePoint: false,
  }))
}

export function wpToRaw(wps: Waypoint[] | undefined): RawCoordinate[] {
  if (!wps) return []
  return wps.map((wp) => [wp.longitude, wp.latitude])
}

export function archsToPos3D(archs: Arch[] | undefined): Position3D[] {
  if (!archs) return []
  return archs.reduce((stack, arch) => {
    if (!arch?.coordinates) return stack
    const points: Position3D[] = arch.coordinates.map((coords) => ({
      x: coords[1],
      y: coords[0],
      ...(!isNil(coords[2]) && { z: coords[2] }),
    }))
    return [...stack, ...points]
  }, [] as Position3D[])
}

export function archsToRawArray(archs: Arch[] | undefined): RawCoordinate[] {
  if (!archs) return []
  return archs.reduce((stack, arch) => {
    const points: RawCoordinate[] = arch.coordinates.map((coords) => [
      coords[0],
      coords[1],
    ])
    return [...stack, ...points]
  }, [] as RawCoordinate[])
}

export function length(track: Polygon | undefined): number {
  if (!track) return 0
  const archs = track.paths[0].arcs
  if (!archs) return 0
  return archs.reduce((stack, arch) => {
    return stack + (arch.length || 0)
  }, 0)
}
