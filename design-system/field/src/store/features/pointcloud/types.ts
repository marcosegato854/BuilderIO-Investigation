/**
 * TYPES
 */
export type PointCloudCommand = {
  command: 'add' | 'remove'
  layer: 'pointcloud' | 'pointbuffer' | 'final'
  id: number
  url?: string
}
export type BufferObj = {
  id: number
  url: string
}
export type PointCloudNotification = {
  commands: PointCloudCommand[]
}

// PointCloud State
type TypeRoleValue =
  | 'X'
  | 'Y'
  | 'Z'
  | 'R'
  | 'G'
  | 'B'
  | 'TIMESTAMP'
  | 'INTENSITY'
type AttributeType = 'F32' | 'F64' | 'U8'
export type HSPCAttribute = {
  name: TypeRoleValue
  role: TypeRoleValue
  type: AttributeType
}
export type PointBufferSettings = {
  'default-attibutes'?: HSPCAttribute[]
  'default-pivot'?: [number, number, number]
  'default-scale'?: [number, number, number]
  folder: string
}
export type PointCloudStateResponse = {
  coordinateSystem: {
    epsg: string
    proj4: string
  }
  hspc: PointBufferSettings
}
export type PointCloudFolderResponse = {}
export type PointCloudHspcListResponse = {
  tree: string[]
  buffer: BufferObj[]
  final: string[]
}
