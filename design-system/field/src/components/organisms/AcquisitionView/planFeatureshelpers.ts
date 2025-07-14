import { Polygon } from 'store/features/planning/types'

/** expand the polygons extracting the tracks inside */
export const expandedPolygons = (polygonList: Polygon[]) => {
  return polygonList.reduce((filteredList: Polygon[], p) => {
    if (p.isPolygon) {
      const newTracks = p.paths
      const newPolygons = newTracks.map((track) => ({
        ...p,
        isPolygon: false,
        paths: [track],
        // TODO wait for a BE + FE fix
        id: track.id! + 1000,
        color: track.color,
        disabled: track.disabled,
      }))
      return [...filteredList, ...newPolygons]
    } else {
      return [...filteredList, p]
    }
  }, [])
}

export const findNextTrack = (
  flatPolygons: Polygon[],
  inCapturePathId?: number
) => {
  // list only enabled polygons
  const enabledPolygons = flatPolygons.filter((fp) => !fp.disabled)
  // look if there's already one in capture
  if (inCapturePathId) {
    return enabledPolygons.find((ep) => ep.paths[0].id === inCapturePathId)
  }
  return enabledPolygons[0]
}
