interface MyVR {
  Browser
  canvas: HTMLCanvasElement
  callback
  createContext
  workerPath: string
  initialize
  render_request
  render
  ALL
  execute
  inputEvent
  destroy
}

interface Point {
  latitude: number
  longitude: number
  height?: number
}

interface Position3D {
  x: number
  y: number
  z?: number
}

interface HitRecordHit {
  id: string | number
}
interface HitRecord {
  hits: HitRecordHit[]
  'layer-id': number
}
interface Hit {
  layer: number
  feature: string | number
}
interface PositionHit {
  distance: number
  height: number
  latitude: number
  layerid: number
  longitude: number
  x: number
  y: number
  z: number
  nx: number
  ny: number
  nz: number
}
interface ScreenPosition {
  pageX: number
  pageY: number
}

interface BoundingBox {
  minLatitude: number
  maxLatitude: number
  minLongitude: number
  maxLongitude: number
}

interface CameraPositionOptions {
  'aabb-max-latitude': number
  'aabb-max-longitude': number
  'aabb-min-latitude': number
  'aabb-min-longitude': number
  height: number
  latitude: number
  longitude: number
  pitch: number
  roll: number
  'target-zoom': number
  yaw: number
}

interface CopyrightInfo {
  alt: string
  boxes: number[][]
  label: string
  maxLevel: number
  minLevel: number
  relevance?: number
}

interface BoundingBoxV3 {
  east: number
  north: number
  west: number
  south: number
  relevance?: number
}

interface CopyrightResourceStylesV3 {
  styles: {
    'explore.day': ('in' | 'jp' | 'sat')[]
    'explore.night': ('in' | 'jp' | 'sat')[]
    'explore.satellite.day': ('in' | 'jp' | 'sat')[]
    'satellite.day': ('in' | 'jp' | 'sat')[]
  }
}

interface CopyrighItemV3 {
  boundingBoxes: BoundingBoxV3[]
  copyrightText: string
  label: string
  maxLevel: number
  minLevel: number
  relevance?: number
}

interface CopyrightResponseV3 {
  copyrights: {
    in: CopyrighItemV3[]
    jp: CopyrighItemV3[]
    sat: CopyrighItemV3[]
  }
  resources: {
    background: CopyrightResourceStylesV3
    base: CopyrightResourceStylesV3
    label: CopyrightResourceStylesV3
  }
}
