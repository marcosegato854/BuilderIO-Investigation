import { curry, flatten, head } from 'ramda'
import { getIntersectingRectangleArea, Rectangle } from 'utils/geom'

const filterZoom = curry(
  (realZoom: number, i: CopyrightInfo | CopyrighItemV3) =>
    realZoom >= i.minLevel && realZoom <= i.maxLevel
)

const sortBoxesByRelevance = (a: number[], b: number[]) => {
  if (a[4] > b[4]) return -1
  if (a[4] < b[4]) return 1
  return 0
}

const sortInfoByRelevance = (
  a: CopyrightInfo | CopyrighItemV3,
  b: CopyrightInfo | CopyrighItemV3
) => {
  const aRel = a.relevance || 0
  const bRel = b.relevance || 0
  if (aRel > bRel) return -1
  if (aRel < bRel) return 1
  return 0
}

const boxRelevance = curry((options: CameraPositionOptions, b: number[]) => {
  const [minLat, minLng, maxLat, maxLng] = b
  const r1: Rectangle = {
    x1: minLat,
    x2: maxLat,
    y1: minLng,
    y2: maxLng,
  }
  const r2: Rectangle = {
    x1: options['aabb-min-latitude'],
    y1: options['aabb-min-longitude'],
    x2: options['aabb-max-latitude'],
    y2: options['aabb-max-longitude'],
  }
  const rel = getIntersectingRectangleArea(r1, r2)
  return [...b, rel]
})

const infoRelevance = curry(
  (options: CameraPositionOptions, i: CopyrightInfo) => {
    const sortedBoxes = i.boxes
      .map(boxRelevance(options))
      .sort(sortBoxesByRelevance)
    const relevance = sortedBoxes[0] ? sortedBoxes[0][4] : 0
    return { ...i, relevance }
  }
)

export const getCurrentCopyright = (
  info: CopyrightInfo[],
  options: CameraPositionOptions,
  realZoom: number
) =>
  head(
    info
      .filter(filterZoom(realZoom))
      .map(infoRelevance(options))
      .sort(sortInfoByRelevance)
  )

/** JAPAN */
export const getStylesKey = (mapStyle: 'satellite' | 'dark' | 'light') => {
  if (mapStyle === 'satellite') return 'satellite.day'
  if (mapStyle === 'light') return 'explore.day'
  return 'explore.night'
}

const boxRelevanceV3 = curry(
  (options: CameraPositionOptions, b: BoundingBoxV3) => {
    const { east, north, west, south } = b
    const r1: Rectangle = {
      x1: north,
      x2: south,
      y1: west,
      y2: east,
    }
    const r2: Rectangle = {
      x1: options['aabb-min-latitude'],
      y1: options['aabb-min-longitude'],
      x2: options['aabb-max-latitude'],
      y2: options['aabb-max-longitude'],
    }
    const rel = getIntersectingRectangleArea(r1, r2)
    return { ...b, relevance: rel }
  }
)

const sortBoxesByRelevanceV3 = (a: BoundingBoxV3, b: BoundingBoxV3) => {
  const aRel = a.relevance || 0
  const bRel = b.relevance || 0
  if (aRel > bRel) return -1
  if (aRel < bRel) return 1
  return 0
}

const infoRelevanceV3 = curry(
  (options: CameraPositionOptions, i: CopyrighItemV3) => {
    const sortedBoxes = i.boundingBoxes
      .map(boxRelevanceV3(options))
      .sort(sortBoxesByRelevanceV3)
    const { relevance } = sortedBoxes[0]
    return { ...i, relevance }
  }
)

export const getCurrentCopyrightV3 = (
  info: CopyrightResponseV3,
  options: CameraPositionOptions,
  realZoom: number,
  mapStyle: 'satellite' | 'dark' | 'light'
) => {
  const stylesKay = getStylesKey(mapStyle)
  const styleKeys = info.resources.base.styles[stylesKay]
  const items = flatten(styleKeys.map((k) => info.copyrights[k]))
  return head(
    items
      .filter(filterZoom(realZoom))
      .map(infoRelevanceV3(options))
      .sort(sortInfoByRelevance)
  )
}
