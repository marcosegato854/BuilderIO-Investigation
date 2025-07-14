/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { compose, curry, equals, identity, keys, omit } from 'ramda'
import {
  IGNORED_FLAT_JOB_TYPE_PROPS,
  IGNORED_JOB_TYPE_PROPS,
  JobType,
} from 'store/features/dataStorage/types'
import {
  ScannerSpecs,
  ScannerSupportedSettings,
  SettingsRow,
} from 'store/features/scanner/types'
import { isArray } from 'util'
import {
  cmToIn,
  cmToKm,
  ftToMt,
  inToCm,
  inToM,
  keepInRange,
  kmToM,
  mToKm,
  mtToFt,
  unitValue,
} from 'utils/numbers'
import { arraysAreEqual, removeUnchangedProps } from 'utils/objects'
import { getRangesForCoordinateSystem } from './ranges'
import { all } from 'redux-saga/effects'

const MAX_SPEED = 130

/**
 * flat representation of the job used for form fields
 */
export interface FlatJob {
  name: string
  image?: string
  planned?: 'true' | 'false'
  type?: string
  dmiType?: DMI['type']
  ntripEnable?: 'true' | 'false'
  collectionmode?: IJob['collectionmode']
  cameraDistance?: number
  cameraElapse?: number
  cameraEnable?: 0 | 1 | 2
  cameraLeftOrientation?: CameraSpecs['orientation']
  cameraRightOrientation?: CameraSpecs['orientation']
  cameraBlur?: 'true' | 'false'
  antennaType?: AntennaInfo['type']
  drivingspeed?: number
  scannerPointPerSecond?: ScannerInfo['pointspersecond']
  scannerRange?: number
  scannerRotationSpeed?: ScannerInfo['rotationspeed']
  scannerScanlineSpacing?: ScannerInfo['scanlinespacing']
  positionSatellites?: PositionInfo['satellites']
  positionAccuracy?: number
  profile?: number
}

const sortSettingRows =
  (k: keyof SettingsRow) => (a: SettingsRow, b: SettingsRow) => {
    if (a[k] < b[k]) return -1
    if (a[k] > b[k]) return 1
    return 0
  }

/* const fitPointsPerSecondInImperialTable = curry(
  (maxRangeTable: ScannerSupportedSettings, n: number) => {
    if (!maxRangeTable.imperial) return 0
    const row =
      [...maxRangeTable.imperial].sort(sortSettingRows('pts')).find((item) => {
        return item.pts >= n
      }) || maxRangeTable.imperial[0]
    return row.pts
  }
) */

const fitPointsPerSecondInMetricTable = curry(
  (maxRangeTable: ScannerSupportedSettings, n: number) => {
    if (!maxRangeTable.settings) return 0
    const row =
      [...maxRangeTable.settings].sort(sortSettingRows('pts')).find((item) => {
        return item.pts >= n
      }) || maxRangeTable.settings[0]
    return row.pts
  }
)

const isInTheRange = (n1: number, n2: number, r: number) =>
  n1 >= n2 - r && n1 <= n2 + r

/* const fitRangeInImperialTable = curry(
  (maxRangeTable: ScannerSupportedSettings, n: number) => {
    if (!maxRangeTable.imperial) return 0
    const row =
      [...maxRangeTable.imperial].sort(sortSettingRows('mr')).find((item) => {
        return isInTheRange(item.mr, n, 2)
      }) || maxRangeTable.imperial[0]
    return row.mr
  }
) */

const fitRangeInMetricTable = curry(
  (maxRangeTable: ScannerSupportedSettings, n: number) => {
    if (!maxRangeTable.settings) return 0
    const row =
      [...maxRangeTable.settings].sort(sortSettingRows('mr')).find((item) => {
        return isInTheRange(item.mr, n, 2)
      }) || maxRangeTable.settings[0]
    return row.mr
  }
)

/* const fitRotationSpeedInImperialTable = curry(
  (maxRangeTable: ScannerSupportedSettings, n: number) => {
    if (!maxRangeTable.imperial) return 0
    const row =
      [...maxRangeTable.imperial].sort(sortSettingRows('rps')).find((item) => {
        return item.rps >= n
      }) || maxRangeTable.imperial[0]
    return row.rps
  }
) */

const fitRotationSpeedInMetricTable = curry(
  (maxRangeTable: ScannerSupportedSettings, n: number) => {
    if (!maxRangeTable.settings) return 0
    const row =
      [...maxRangeTable.settings].sort(sortSettingRows('rps')).find((item) => {
        return item.rps >= n
      }) || maxRangeTable.settings[0]
    return row.rps
  }
)

/**
 * converts a job in a format suitable for the form
 * @param job IJob
 * @returns FlatJob
 */
export const flattenJob = (
  job: IJob,
  unit: 'metric' | 'imperial',
  scannerModel: ScannerSpecs['manufacturer'] | null | undefined,
  supportedSettings: ScannerSupportedSettings
): FlatJob => {
  /** prepare parametric values */
  const scannerPointPerSecond = compose(
    fitPointsPerSecondInMetricTable(supportedSettings)
  )(job.scanner?.pointspersecond || 0)
  const scannerRotationSpeed = compose(
    fitRotationSpeedInMetricTable(supportedSettings)
  )(job.scanner?.rotationspeed || 0)
  const drivingspeed = getMaxSpeed(
    job.camera?.distance || 0,
    job.scanner?.scanlinespacing || 0,
    scannerRotationSpeed,
    scannerModel
  )
  // const drivingspeed = Math.min(
  //   speedForCameraDistance(job.camera?.distance || 0, unit),
  //   speedForScanlineSpacing(
  //     job.scanner?.scanlinespacing || 0,
  //     scannerRotationSpeed || 0,
  //     unit
  //   )
  // )
  // no need to take care of the unit, it's always expressed in meters
  const scannerRange = Number(job.scanner?.range) || 0
  const cameraDistance = Number(job.camera?.distance) || 0
  const scannerScanlineSpacing = Number(job.scanner?.scanlinespacing || 0)

  /** compose flatjob */
  const out: FlatJob = {
    name: job.name,
    image: job.image,
    planned: job.planned ? 'true' : 'false',
    type: job.type,
    dmiType: job.dmi?.type,
    ntripEnable: job.ntrip?.enable ? 'true' : 'false',
    collectionmode: job.collectionmode,
    cameraDistance,
    cameraElapse: job.camera?.elapse || 0,
    cameraEnable: job.camera?.enable,
    cameraBlur: job.camera?.blur === false ? 'false' : 'true',
    cameraLeftOrientation: undefined,
    cameraRightOrientation: undefined,
    antennaType: job.antenna?.type,
    drivingspeed,
    scannerPointPerSecond,
    // scannerPointPerSecond: Number(job.scanner?.pointspersecond) || 0,
    scannerRange,
    scannerRotationSpeed,
    // scannerRotationSpeed: Number(job.scanner?.rotationspeed) || 0,
    scannerScanlineSpacing,
    positionSatellites: job.position?.satellites,
    profile: job.profile,
  }
  if (job.position?.accuracy?.low && job.position?.accuracy?.high)
    out.positionAccuracy = flattenPositionAccuracy(
      job.position.accuracy.low,
      job.position.accuracy.high
    )
  return out
}

const flattenPositionAccuracy = (low: number, high: number) => {
  if (low === 0.02 && high === 0.05) return 2
  if (low === 0.1 && high === 0.2) return 10
  return 5
}

/**
 * converts a flattened job back to the format accepted from the API
 * @param flatJob FlatJob
 * @returns IJob
 */
export const unflattenJob = (
  flatJob: FlatJob,
  coordinateUnit?: 'metric' | 'imperial'
): IJob => {
  const unit = coordinateUnit || 'metric'
  return {
    name: flatJob.name,
    image: flatJob.image,
    planned: flatJob.planned === 'true',
    type: flatJob.type,
    dmi: {
      type: flatJob.dmiType || 'none',
    },
    ntrip: {
      enable: flatJob.ntripEnable === 'true',
    },
    collectionmode: flatJob.collectionmode,
    camera: {
      enable: flatJob.cameraEnable,
      blur: flatJob.cameraBlur === 'true',
      // no need to take care of the unit, it's always expressed in meters
      distance: Number(flatJob.cameraDistance) || 0,
      elapse: flatJob.cameraElapse || 0,
      left: {
        orientation: flatJob.cameraLeftOrientation,
      },
      right: {
        orientation: flatJob.cameraRightOrientation,
      },
    },
    antenna: {
      type: flatJob.antennaType || 'single',
    },
    drivingspeed: Number(flatJob.drivingspeed),
    scanner: {
      pointspersecond: Number(flatJob.scannerPointPerSecond) || 0,
      range: Number(flatJob.scannerRange) || 0,
      rotationspeed: Number(flatJob.scannerRotationSpeed) || 0,
      scanlinespacing: Number(flatJob.scannerScanlineSpacing || 0),
    },
    position: {
      satellites: flatJob.positionSatellites || [],
      accuracy: {
        low:
          (flatJob.positionAccuracy &&
            unflattenPositionAccuracy(flatJob.positionAccuracy)[0]) ||
          0,
        high:
          (flatJob.positionAccuracy &&
            unflattenPositionAccuracy(flatJob.positionAccuracy)[1]) ||
          0,
      },
    },
    profile: flatJob.profile,
  }
}

const unflattenPositionAccuracy = (accuracy: number) => {
  if (accuracy === 2) return [0.02, 0.05]
  if (accuracy === 10) return [0.1, 0.2]
  return [0.05, 0.1]
}

const processValues = (
  valueKey: keyof FlatJob,
  values: FlatJob,
  newValue: number | string,
  scannerModel: ScannerSpecs['manufacturer'] | null | undefined,
  supportedSettings: ScannerSupportedSettings
): Partial<FlatJob> => {
  switch (valueKey) {
    case 'cameraDistance':
      return handleCameraDistance(values, Number(newValue), scannerModel)
    /** disabled because now the speed is not set by the user
    case 'drivingspeed':
      return handleDrivingSpeed(values, Number(newValue), unit)
      */
    case 'scannerScanlineSpacing':
      return handleScanlineSpacing(values, Number(newValue))
    case 'scannerRotationSpeed':
      return handleScannerRangeValues(
        'scannerRotationSpeed',
        values,
        Number(newValue),
        scannerModel,
        supportedSettings
      )
    case 'scannerPointPerSecond':
      return handleScannerRangeValues(
        'scannerPointPerSecond',
        values,
        Number(newValue),
        scannerModel,
        supportedSettings
      )
    case 'scannerRange':
      return handleScannerRangeValues(
        'scannerRange',
        values,
        Number(newValue),
        scannerModel,
        supportedSettings
      )
    case 'cameraEnable':
      return handleCameraEnable(values, newValue as 0 | 1 | 2, scannerModel)
  }
  return {}
}

export const getJobValuesToUpdate = (
  valueKey: keyof FlatJob,
  newValue: number | string,
  values: FlatJob | undefined,
  scannerModel: ScannerSpecs['manufacturer'] | null | undefined,
  supportedSettings: ScannerSupportedSettings
): Partial<FlatJob> => {
  if (!values) return {}
  const dirtyResult = processValues(
    valueKey,
    values,
    newValue,
    scannerModel,
    supportedSettings
  )
  const cleanResult = removeUnchangedProps(dirtyResult, values)
  const inRangeResult = fixRanges(cleanResult, supportedSettings)
  return inRangeResult
}

/**
 * ensures that the values returned are inside the specified ranges
 * */
const fixRanges = (
  flatJob: Partial<FlatJob>,
  supportedSettings: ScannerSupportedSettings
): Partial<FlatJob> => {
  const ranges = getRangesForCoordinateSystem(supportedSettings)
  type RangeKey = keyof typeof ranges
  const out = keys(flatJob).reduce((stack, key) => {
    if (ranges[key as RangeKey]) {
      return {
        ...stack,
        [key]: keepInRange(
          Number(flatJob[key]),
          ranges[key as RangeKey].min,
          ranges[key as RangeKey].max
        ),
      }
    }
    return stack
  }, {} as Partial<FlatJob>)
  return flatJob
}

export const getMaxSpeed = (
  frameDistance: number,
  scannerScanlineSpacing: number,
  scannerRotationSpeed: number,
  scannerModel: ScannerSpecs['manufacturer'] | null | undefined
): number => {
  const maxSpeed = ['Optech', 'ZF', null, undefined].includes(scannerModel)
    ? Math.min(
        speedForCameraDistance(frameDistance),
        speedForScanlineSpacing(scannerScanlineSpacing, scannerRotationSpeed)
      )
    : speedForCameraDistance(frameDistance)
  return Math.min(maxSpeed, MAX_SPEED)
}

const handleCameraEnable = (
  values: FlatJob,
  newValue: 0 | 1 | 2,
  scannerModel: ScannerSpecs['manufacturer'] | null | undefined
): Partial<FlatJob> => {
  const out = {} as Partial<FlatJob>
  // check drivingspeed
  const speedWithNoCamera = () => {
    if (scannerModel === 'Velodyne' || scannerModel === 'Hesai') {
      return MAX_SPEED
    } else {
      return speedForScanlineSpacing(
        values.scannerScanlineSpacing!,
        values.scannerRotationSpeed!
      )
    }
  }
  const maxSpeed =
    newValue === 1
      ? getMaxSpeed(
          values.cameraDistance!,
          values.scannerScanlineSpacing!,
          values.scannerRotationSpeed!,
          scannerModel
        )
      : speedWithNoCamera()
  const limitedMaxSpeed = Math.min(maxSpeed, MAX_SPEED)
  if (values.drivingspeed) out.drivingspeed = limitedMaxSpeed
  return out
}

const handleCameraDistance = (
  values: FlatJob,
  newValue: number,
  scannerModel: ScannerSpecs['manufacturer'] | null | undefined
): Partial<FlatJob> => {
  const out = {} as Partial<FlatJob>
  // check drivingspeed
  const maxSpeed = getMaxSpeed(
    newValue,
    values.scannerScanlineSpacing || 0,
    values.scannerRotationSpeed || 0,
    scannerModel
  )

  // debug ->
  // console.log(
  //   newValue,
  //   values.scannerScanlineSpacing,
  //   values.scannerRotationSpeed,
  //   unit,
  //   speedForCameraDistance(newValue, unit),
  //   speedForScanlineSpacing(
  //     values.scannerScanlineSpacing!,
  //     values.scannerRotationSpeed!,
  //     unit
  //   )
  // )
  // <- debug

  // if (values.drivingspeed && values.drivingspeed > maxSpeed)
  if (values.drivingspeed) out.drivingspeed = maxSpeed
  /** disabled because now the speed is not set by the user
   // recalculate scanline spacing
   if (!out.drivingspeed) return out
  const newSanlineSpacing = scanlineSpacing(
    out.drivingspeed,
    values.scannerRotationSpeed!,
    unit
  )
  out.scannerScanlineSpacing = newSanlineSpacing
  */
  return out
}

/** disabled because now the speed is not set by the user
const handleDrivingSpeed = (
  values: FlatJob,
  newValue: number,
  unit: 'metric' | 'imperial'
): Partial<FlatJob> => {
  const out = {} as Partial<FlatJob>
  // check camera distance
  const minCameraDistance = cameraDistance(newValue, unit)
  if (values.cameraDistance && values.cameraDistance < minCameraDistance)
    out.cameraDistance = minCameraDistance
  // recalculate scanline spacing
  const newSanlineSpacing = scanlineSpacing(
    newValue!,
    values.scannerRotationSpeed!,
    unit
  )
  out.scannerScanlineSpacing = newSanlineSpacing
  return out
}
*/

const handleScannerRangeValues = (
  key: keyof FlatJob,
  values: FlatJob,
  newValue: number,
  scannerModel: ScannerSpecs['manufacturer'] | null | undefined,
  supportedSettings: ScannerSupportedSettings
): Partial<FlatJob> => {
  const out = {} as Partial<FlatJob>
  // get the values
  let params
  switch (key) {
    case 'scannerRotationSpeed':
      params = { rps: newValue }
      break
    case 'scannerRange':
      params = { mr: newValue }
      break
    case 'scannerPointPerSecond':
      params = { pts: newValue }
      break
  }
  if (!params) return {}

  const oldValues: ScannerRangeValues = {
    mr: values.scannerRange!,
    pts: values.scannerPointPerSecond!,
    rps: values.scannerRotationSpeed!,
  }
  const newValues = matchScannerRangeValues(
    params,
    oldValues,
    supportedSettings
  )
  if (key !== 'scannerPointPerSecond') out.scannerPointPerSecond = newValues.pts
  if (key !== 'scannerRange') out.scannerRange = newValues.mr
  if (key !== 'scannerRotationSpeed') out.scannerRotationSpeed = newValues.rps
  // update scanline spacing
  /** disabled because now the speed is not set by the user
  out.scannerScanlineSpacing = scanlineSpacing(
    values.drivingspeed!,
    newValues.rps,
    unit
    )
    */
  // check drivingspeed
  const rps = key !== 'scannerRotationSpeed' ? newValues.rps : newValue
  const maxSpeed =
    values.cameraEnable === 1
      ? getMaxSpeed(
          values.cameraDistance || 0,
          values.scannerScanlineSpacing || 0,
          rps,
          scannerModel
        )
      : speedForScanlineSpacing(values.scannerScanlineSpacing!, rps)
  if (values.drivingspeed) out.drivingspeed = Math.min(maxSpeed, MAX_SPEED)
  return out
}

const handleScanlineSpacing = (
  values: FlatJob,
  newValue: number
): Partial<FlatJob> => {
  const out = {} as Partial<FlatJob>
  // check drivingspeed
  const maxSpeed =
    values.cameraEnable === 1
      ? Math.min(
          speedForScanlineSpacing(newValue!, values.scannerRotationSpeed!),
          speedForCameraDistance(values.cameraDistance!)
        )
      : speedForScanlineSpacing(newValue!, values.scannerRotationSpeed!)

  // debug ->
  // console.log(
  //   newValue,
  //   values.scannerRotationSpeed,
  //   values.cameraDistance,
  //   unit,
  //   speedForScanlineSpacing(newValue!, values.scannerRotationSpeed!, unit),
  //   speedForCameraDistance(values.cameraDistance!, unit)
  // )
  // <- debug

  // if (values.drivingspeed && values.drivingspeed > maxSpeed)
  if (values.drivingspeed) out.drivingspeed = Math.min(maxSpeed, MAX_SPEED)
  // if (!out.drivingspeed) return out
  // speed can only go down, so camera distance is not affected
  return out
}

export type ScannerRangeValues = {
  rps: number
  pts: number
  mr: number
}

export const scannerRangeValues = (
  params: Partial<ScannerRangeValues>,
  unit: 'metric' | 'imperial',
  maxRangeTable: ScannerSupportedSettings
): ScannerRangeValues => {
  if (!maxRangeTable.settings || maxRangeTable.settings?.length === 0) {
    console.warn('[SCANNERS] settings not available')
    return {
      mr: 0,
      pts: 0,
      rps: 0,
    }
  }
  // TODO: maybe we should prioritize keeping pts over rps
  if (params.mr)
    return (
      [...maxRangeTable.settings!].reverse().find((item) => {
        return item.mr >= params.mr!
      }) || maxRangeTable.settings![0]
    )
  return (
    maxRangeTable.settings!.find((item) => {
      if (params.pts) return item.pts === params.pts
      if (params.rps) return item.rps === params.rps
      return false
    }) || maxRangeTable.settings![0]
  )
}

export const matchScannerRangeValues = (
  newParam: Partial<ScannerRangeValues>,
  oldParam: ScannerRangeValues,
  supportedSettings: ScannerSupportedSettings
): ScannerRangeValues => {
  if (!supportedSettings.settings || supportedSettings.settings?.length === 0) {
    console.warn('[SCANNERS] settings not available')
    return {
      mr: 0,
      pts: 0,
      rps: 0,
    }
  }

  // list all the properties
  const propertiesArray = Object.keys(oldParam) as (keyof ScannerRangeValues)[]

  // identify the main property (clicked one)
  const priority = Object.keys(newParam)[0] as keyof ScannerRangeValues

  // find the possible settings for the main property
  const allowedValues = supportedSettings.settings.filter(
    (setting) => setting[priority] === newParam[priority]
  )

  // list the other properties to check
  const propertiesToCheck = propertiesArray.filter((pa) => pa !== priority)

  // filter the properties to find if an already present value can be kept
  const propertiesToKeep = propertiesToCheck.filter((property) =>
    allowedValues.find((av) => av[property] === oldParam[property])
  )

  // find the setting row that includes the requested properties
  return (
    allowedValues.find((value) =>
      propertiesToKeep.every(
        (property) => value[property] === oldParam[property]
      )
    ) || ({ mr: 0, pts: 0, rps: 0 } as ScannerRangeValues)
  )
}

/** we stick to the table, this should not be used */
export const scannerRange = (
  rps: number,
  pts: number,
  unit: 'metric' | 'imperial'
): number => {
  const magic1 = 38794
  const magic2 = 300000000
  const walkOff = Math.round(magic1 / rps)
  const pulseInTheAir = Math.round(magic2 / pts / 2 - 50)
  return Math.min(walkOff, pulseInTheAir)
}

export const cameraDistance = (speed: number, fps: number = 7): number => {
  const unitFactor = 1000
  return Math.floor((speed * unitFactor) / 3600 / fps)
}

export const speedForCameraDistance = (
  cameraDistanceMt: number,
  fps: number = 7
): number => {
  const unitFactor = 1000
  return Math.floor(1 / (unitFactor / 3600 / fps / cameraDistanceMt))
}

export const scanlineSpacing = (speed: number, rps: number): number => {
  const mSec = speed / 3.6
  const unitFactor = 100
  const convertedDistancePerSecond = mSec * unitFactor
  return Math.max(Math.round(convertedDistancePerSecond / rps), 1)
}

export const speedForScanlineSpacing = (
  scanlineSpacingDistance: number,
  rps: number
): number => {
  const distanceSec = scanlineSpacingDistance * rps
  const distanceH = distanceSec * 3600
  const converter = cmToKm
  const convertedDistanceH = converter(distanceH)

  // debug ->
  // console.log(
  //   'utils.ts (514) # distanceH',
  //   scanlineSpacingDistance,
  //   rps,
  //   unit,
  //   distanceH,
  //   convertedDistanceH
  // )
  // <- debug

  return Math.max(Math.round(convertedDistanceH), 1)
}

export const checkJobtypeChangesWithFlatjob = (
  jobType: JobType,
  job: FlatJob,
  unit: 'metric' | 'imperial',
  scannerModel: ScannerSpecs['manufacturer'] | null | undefined,
  supportedSettings: ScannerSupportedSettings,
  checkAll?: boolean
): string[] => {
  const flatJobType = flattenJob(jobType, unit, scannerModel, supportedSettings)
  const changedValues = keys(flatJobType).filter((prop) => {
    const IGNORED_PROPS = checkAll ? [] : IGNORED_FLAT_JOB_TYPE_PROPS
    if (IGNORED_PROPS.includes(prop)) return false
    if (typeof flatJobType[prop] === 'undefined') return false
    const out = Array.isArray(flatJobType[prop])
      ? !arraysAreEqual(flatJobType[prop], job[prop])
      : !equals(flatJobType[prop], job[prop])
    if (out && !checkAll)
      console.info(
        `[JOB FORM] CUSTOM: prop: ${prop} - value: ${job[prop]}`,
        flatJobType[prop]
      )
    return out
  })
  return changedValues
}

export const createJobtypeFromJob = (
  job: IJob,
  jobTypeName: string
): JobType => {
  // exclude some props
  // const { name, image, acquired, planned, antenna, ...goodProps } = job
  const goodProps = omit(IGNORED_JOB_TYPE_PROPS, job)
  return { ...goodProps, name: jobTypeName }
}

export const maxSettingsValue = curry(
  (
    supportedSettings: ScannerSupportedSettings,
    unit: Coordinate['unit'],
    property: keyof SettingsRow
  ) => {
    return supportedSettings.settings?.reduce((stack, row) => {
      if (row[property] > stack) return row[property]
      return stack
    }, 0)
  }
)

export const scannerInitialRangeOption = (
  supportedSettings: ScannerSupportedSettings,
  unit: Coordinate['unit'],
  ptsValue: number | undefined,
  rpsValue: number | undefined
) => {
  if (!supportedSettings.settings) return 0
  const mrValueRow = supportedSettings.settings?.find(
    (s) => s.pts === ptsValue && s.rps === rpsValue
  )
  return mrValueRow?.mr
}
