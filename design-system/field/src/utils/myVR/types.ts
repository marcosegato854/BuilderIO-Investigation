export enum Layers {
  MAP = 0,
  OPEN_STREET_MAP_SERVICE_HEIGHTMAP = 2,
  TILE_MAP_SERVICE = 3,
  FEATURES_TRACKLINE = 4, // (navigation track, picture placeholder, path, polygon side)
  FEATURES_SCAN_RANGE = 5, // (scan range)
  FEATURES_PLANNING_TRACK = 6, // (drawing track)
  FEATURES_POLYLINE = 7, // (drawing track)
  FEATURES_2 = 8, // (path vertex, polygon, polygon temporary vertex)
  MODEL = 9,
  FEATURES_3 = 10, // (distance label)
  ICONS = 11, // (markers)
  WAYPOINTS = 12, // (planning waypoints)
  NEXT_TRACK = 13, // (acquisition next track)
  MAP3D_INPUT = 20,
  HSPC_TREE = 4556, // (path vertex, polygon, polygon temporary vertex)
  HSPC_POINT_BUFFER = 4557, // (path vertex, polygon, polygon temporary vertex)
}
export enum Models {
  CAR = 1,
}
export type MyVRFunctor = (myVR: MyVR) => MyVR
export type MyVRCommandObject = {
  command: string
  composite?: number
  layer?: Layers
  [key: string]: unknown
}
export type MyVRLayerObject = {
  id: Layers
}
export interface ColorsRGB {
  red: number[]
  green: number[]
  blue: number[]
  purple: number[]
  white: number[]
  yellow: number[]
  ocher: number[]
  transparentBlue: number[]
  transparentGrey: number[]
}
export type CKey = keyof ColorsRGB
export type LKey = keyof Layers
export type NavigationTrackColorID = {
  averageAccuracy: CKey
  badAccuracy: CKey
  goodAccuracy: CKey
}
export type NavigationTrackColor = {
  averageAccuracy: number[]
  badAccuracy: number[]
  goodAccuracy: number[]
}
export interface MyVRStyle {
  navigationTrack: {
    color: NavigationTrackColor
    thickness: number
  }
  picturePlaceholder: {
    color: number[]
    size: number
  }
  scanningRange: {
    color: number[]
    diameter: number
  }
  path: {
    color: number[]
    thickness: number
    vertex: {
      border: {
        color: number[]
      }
      innerArea: {
        color: number[]
      }
      size: 10
    }
  }
  polygon: {
    border: {
      color: number[]
      thickness: 20
    }
    innerArea: {
      color: number[]
    }
    temporaryVertex: {
      border: {
        color: number[]
      }
      innerArea: {
        color: number[]
      }
      size: 50
    }
  }
  distanceLabel: {
    text: {
      color: number[]
      size: 1
    }
  }
}
export type Position = {
  latitude: number
  longitude: number
  height?: number
  pitch?: number
  roll?: number
  ['target-zoom']?: number
  type?: string
  yaw?: number
}

export enum MapMode {
  MAP_2D = '2d',
  MAP_3D = '3d',
}

export enum MapView {
  SATELLITE = 'satellite',
  THEME = 'theme',
}
