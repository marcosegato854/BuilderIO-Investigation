interface LogItem {
  type: 'log' | 'info' | 'warn' | 'error'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[]
  time: number
}

interface CustomHandler {
  (a?: string | number | Object): void
}

interface IOption {
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: string | number | any
  enable?: boolean
}

interface IOptionDisk extends IOption {
  critical?: boolean
  health?: number
}

interface IClickableOption extends IOption {
  dontCloseOnClick?: boolean
  onClick?: React.MouseEventHandler<HTMLElement, MouseEvent> & CustomHandler
}
interface Coordinate {
  name?: string
  unit: 'metric' | 'imperial'
  unitscale?: number
  automatic?: boolean
  locked?: boolean
}

interface IProject extends NamedEntity {
  /**
   * Hard disk contiaining the project
   */
  disk: string
  /**
   * Numbers of Jobs the Project has.
   */
  jobs?: number
  /**
   * Numbers of Jobs acquired.
   */
  jobsAcquired?: number
  /**
   * Image of the Project. Optional.
   */
  image?: string
  /**
   * Percentage of the progress.
   */
  completed?: number
  /**
   * Coordinates of the project
   */
  coordinate?: Coordinate
  /**
   * Number of control points
   */
  controlpoints?: number
  /**
   * Size of the project
   */
  size?: number
  /**
   * Creation date of the project (eg. 2021-05-18T16:02:16Z)
   */
  creationdate?: string
  /**
   * Last update date of the project (eg. 2021-05-18T16:02:16Z)
   */
  updatedate?: string
  /**
   * array of warnings
   */
  warnings?: string[]
}

interface NTrip {
  /**
   * RTK Enabled
   */
  enable?: boolean
  /**
   * Server name
   */
  name?: string
  /**
   * Server address
   */
  server?: string
  /**
   * Username
   */
  user?: string
  /**
   * Password
   */
  password?: string
  /**
   * Mountpoint
   */
  mountpoint?: string
  /**
   * Interface Mode
   */
  interfacemode?: string
}

interface LeverArm {
  x: number
  y?: number
  z?: number
}

interface DMI {
  /**
   * Type
   */
  type: 'none' | 'optical' | 'mechanical'
  /**
   * Leverarm
   */
  leverarm?: LeverArm
}

interface CameraSpecs {
  orientation?: 'portrait' | 'landscape'
}

interface CameraInfo {
  /**
   * 0 = disabled
   * 1 = distance
   * 2 = time
   */
  enable?: 0 | 1 | 2
  blur?: boolean
  distance?: number
  elapse?: number
  frames?: number
  left?: CameraSpecs
  right?: CameraSpecs
}

interface AntennaInfo {
  /**
   * Antenna type
   */
  type: 'single' | 'double'
  /**
   * Leverarm
   */
  leverarm?: LeverArm
}

interface ScannerInfo {
  scanlinespacing: number
  rotationspeed: number
  pointspersecond: number
  range: number
}

interface PositionInfo {
  accuracy?: {
    low?: number
    high?: number
  }
  satellites: string[]
}

interface ProcessingError {
  code: string
  description: string
  type: number // 1=warning, 2=error
  time?: string
  p1?: string
  p2?: string
  p3?: string
}

interface ProcessingFinaliseConfig {
  enable?: boolean
  done?: boolean
}

interface ProcessingExportConfig extends ProcessingFinaliseConfig {
  password?: string
  decimation?: {
    enable: boolean
    voxelSize: number
  }
}

interface ProcessingExportOptions {
  las: ProcessingExportConfig
  lgsx: ProcessingExportConfig
  e57: ProcessingExportConfig
}

interface ProcessingFinalizeOptions {
  // removed because it's always ON
  // stitching: ProcessingFinaliseConfig
  blur: ProcessingFinaliseConfig
  colorization: ProcessingFinaliseConfig
}

interface ProcessingOptions {
  export: ProcessingExportOptions
  finalise: ProcessingFinalizeOptions
}

interface IJob extends NamedEntity {
  /**
   * Numbers of Scans the Job has.
   */
  scans?: number
  /**
   * Image of the Job. Optional.
   */
  image?: string
  /**
   * Type of planning
   */
  planned?: boolean
  /**
   * Type of job
   */
  type?: string
  /**
   * Position Accuracy
   */
  dmi?: DMI
  /**
   * Rtk
   */
  ntrip?: NTrip
  /**
   * Collection mode
   */
  collectionmode?: 'oneway' | 'bothways'
  // collectionmode?: 'oneway' | 'bothways' | 'other'
  /**
   * Camera
   */
  camera?: CameraInfo
  /**
   * Type of antenna
   */
  antenna?: AntennaInfo
  /**
   * DriveSpeed
   */
  drivingspeed?: number
  /**
   * Scanner info
   */
  scanner?: ScannerInfo
  /**
   * Position info
   */
  position?: PositionInfo
  /**
   * Size of the Job
   */
  size?: number
  /**
   * Creation date of the job (eg. 2021-05-18T16:02:16Z)
   */
  creationdate?: string
  /**
   * Last update date of the job (eg. 2021-05-18T16:02:16Z)
   */
  updatedate?: string
  /**
   * Percentage of the progress.
   */
  completed?: number
  /**
   * Job has already been acquired
   */
  acquired?: boolean
  /**
   * Job profile (vehicle). mapped on AcquisitionProfile in datastorage types
   */
  profile?: number
  /**
   * array of warnings
   */
  warnings?: string[]
  /**
   * Device model
   */
  hardwareModel?: string
  /**
   * Sensor Unit serial number
   */
  snSensorUnit?: string
  /**
   * Finalise and export options and status
   */
  processOutput?: {
    isImageAIdone?: boolean
    progress?: number
    options?: ProcessingOptions
    errors?: ProcessingError[]
  }
}

interface ProcessingResult {
  messages: number
  warnings: number
  errors: number
}

interface Units {
  KMH: string
  M: string
  CM: string
  HZ: string
  MSEC: string
}

interface NamedEntity {
  name: string
}

interface HereMapsItem {
  id: string
  title: string
  resultType: string
  position: {
    lat: number
    lng: number
  }
}

interface IDisk {
  /**
   * Name of the disk
   */
  name?: string
  /**
   * Total disk space
   */
  total?: number
  /**
   * Available disk space
   */
  available?: number
  /**
   * Health of the disk, higher is better
   */
  health?: number
  /**
   * Is the disk removable?
   */
  removable?: boolean
  /**
   * Is the status critical?
   */
  critical?: boolean
  /**
   * Is the default disk?
   */
  default?: boolean
  /**
   * Slot number
   */
  slot?: number
}

/** modules without definitions, maybe move to a separate file */
declare module 'react-prismazoom'

interface EasySpeech {
  cancel: () => void
  defaults: (SpeechSynthesisUtterance) => void
  detect: () => void
  init: () => boolean
  on: (SpeechSynthesisEvent) => void
  pause: () => void
  reset: () => void
  resume: () => void
  speak: (SpeechSynthesisUtterance) => void
  status: () => {
    status: string
    initialized: boolean
    speechSynthesis: speechSynthesis
    speechSynthesisUtterance: SpeechSynthesisUtterance
    speechSynthesisVoice: SpeechSynthesisVoice
    speechSynthesisEvent: SpeechSynthesisEvent
    speechSynthesisErrorEvent: SpeechSynthesisErrorEvent
    voices: SpeechSynthesisVoice[]
    defaults: {
      pitch: number
      rate: number
      volume: number
      voice: SpeechSynthesisVoice | null
    }
    handlers: {}
  }
  voices: () => SpeechSynthesisVoice[]
}
declare module 'easy-speech' {
  const EasySpeech: EasySpeech
  export = EasySpeech
}

interface Environment {
  production: boolean
  disableScanRange: boolean
  disableTrackStyles: boolean
  disableWaypoints: boolean
}
