import { mockStore } from 'store/mock/mockStoreTests'
import {
  cameraDistance,
  FlatJob,
  getJobValuesToUpdate,
  matchScannerRangeValues,
  scanlineSpacing,
  ScannerRangeValues,
  scannerRangeValues,
  speedForCameraDistance,
  speedForScanlineSpacing,
} from './utils'

const tables = mockStore.scanner.supportedSettings!

describe('Job Form Linked Values Formulas (metric)', () => {
  beforeEach(() => {})
  const unit = 'metric'
  test('Should not change any value if values are missing', () => {
    expect(
      getJobValuesToUpdate('antennaType', 1, undefined, 'ZF', tables)
    ).toEqual({})
  })
  test('Calculate max camera distance from speed', () => {
    expect(cameraDistance(50)).toEqual(1)
    expect(cameraDistance(101)).toEqual(4)
    expect(cameraDistance(120)).toEqual(4)
  })
  test('Calculate max speed from camera distance', () => {
    expect(speedForCameraDistance(2)).toEqual(50)
    expect(speedForCameraDistance(3)).toEqual(75)
  })
  test('Calculate scanline spacing from speed and rps', () => {
    expect(scanlineSpacing(50, 100)).toEqual(14)
    expect(scanlineSpacing(75, 100)).toEqual(21)
    expect(scanlineSpacing(101, 100)).toEqual(28)
    expect(scanlineSpacing(50, 50)).toEqual(28)
    expect(scanlineSpacing(75, 50)).toEqual(42)
    expect(scanlineSpacing(101, 50)).toEqual(56)
    expect(scanlineSpacing(30, 50)).toEqual(17)
  })
  test('Calculate max speed for scanlineSpacing and RPS', () => {
    expect(speedForScanlineSpacing(3, 100)).toEqual(11)
    expect(speedForScanlineSpacing(4, 100)).toEqual(14)
    expect(speedForScanlineSpacing(6, 100)).toEqual(22)
    expect(speedForScanlineSpacing(3, 50)).toEqual(5)
    expect(speedForScanlineSpacing(4, 50)).toEqual(7)
    expect(speedForScanlineSpacing(6, 50)).toEqual(11)
    expect(speedForScanlineSpacing(1, 50)).toEqual(2)
  })
  // not used, we stick to the table instead of calculating the values
  // test('Calculate scanner range', () => {
  //   expect(scannerRange(50, 200000, unit)).toEqual(tables.metric[0].mr)
  //   expect(scannerRange(100, 200000, unit)).toEqual(tables.metric[1].mr)
  //   expect(scannerRange(250, 500000, unit)).toEqual(tables.metric[4].mr)
  // })
  test('Get scanner range values', () => {
    const oldParam: ScannerRangeValues = {
      rps: 0,
      pts: 0,
      mr: 0,
    }
    expect(matchScannerRangeValues({ rps: 53 }, oldParam, tables)).toEqual(
      tables.settings[0]
    )
    expect(matchScannerRangeValues({ rps: 267 }, oldParam, tables)).toEqual(
      tables.settings[4]
    )
    expect(matchScannerRangeValues({ rps: 214 }, oldParam, tables)).toEqual(
      tables.settings[9]
    )
    expect(matchScannerRangeValues({ pts: 547000 }, oldParam, tables)).toEqual(
      tables.settings[0]
    )
    expect(matchScannerRangeValues({ pts: 1094000 }, oldParam, tables)).toEqual(
      tables.settings[5]
    )
    expect(matchScannerRangeValues({ mr: 182 }, oldParam, tables)).toEqual(
      tables.settings[0]
    )
  })
})

// BE works with metric values only
/* describe('Job Form Linked Values Formulas (imperial)', () => {
  beforeEach(() => {})
  const unit = 'imperial'
  test('Should not change any value if values are missing', () => {
    expect(
      getJobValuesToUpdate('antennaType', 1, undefined, unit, 'ZF', tables)
    ).toEqual({})
  })
  test('Calculate max camera distance from speed', () => {
    expect(cameraDistance(48, unit)).toEqual(10)
    expect(cameraDistance(75, unit)).toEqual(15)
    expect(cameraDistance(101, unit)).toEqual(21)
  })
  test('Calculate max speed from camera distance', () => {
    expect(speedForCameraDistance(10, unit)).toEqual(47)
    expect(speedForCameraDistance(3, unit)).toEqual(14)
    expect(speedForCameraDistance(4, unit)).toEqual(19)
  })
  test('Calculate scanline spacing from speed and rps', () => {
    expect(scanlineSpacing(50, 100, unit)).toEqual(88)
    expect(scanlineSpacing(75, 100, unit)).toEqual(132)
    expect(scanlineSpacing(101, 100, unit)).toEqual(178)
    expect(scanlineSpacing(50, 50, unit)).toEqual(176)
    expect(scanlineSpacing(75, 50, unit)).toEqual(264)
    expect(scanlineSpacing(101, 50, unit)).toEqual(356)
    expect(scanlineSpacing(30, 50, unit)).toEqual(106)
  })
  test('Calculate max speed for scanlineSpacing and RPS', () => {
    expect(speedForScanlineSpacing(3, 100, unit)).toEqual(17)
    expect(speedForScanlineSpacing(4, 100, unit)).toEqual(23)
    expect(speedForScanlineSpacing(6, 100, unit)).toEqual(34)
    expect(speedForScanlineSpacing(3, 50, unit)).toEqual(9)
    expect(speedForScanlineSpacing(4, 50, unit)).toEqual(11)
    expect(speedForScanlineSpacing(6, 50, unit)).toEqual(17)
    expect(speedForScanlineSpacing(1, 50, unit)).toEqual(3)
  })
  test('Get scanner range values', () => {
    const oldParam: ScannerRangeValues = {
      rps: 0,
      pts: 0,
      mr: 0,
    }
    expect(matchScannerRangeValues({ rps: 107 }, oldParam, tables)).toEqual(
      tables.settings[0]
    )
    expect(matchScannerRangeValues({ rps: 267 }, oldParam, tables)).toEqual(
      tables.settings[3]
    )
    expect(matchScannerRangeValues({ pts: 547000 }, oldParam, tables)).toEqual(
      tables.settings[0]
    )
    expect(matchScannerRangeValues({ pts: 1094000 }, oldParam, tables)).toEqual(
      tables.settings[4]
    )
    expect(matchScannerRangeValues({ mr: 182 }, oldParam, tables)).toEqual(
      tables.settings[0]
    )
  })
}) */

describe('Job Form Linked Values Interconnection (metric)', () => {
  const unit = 'metric'
  let values: FlatJob
  beforeEach(() => {
    values = {
      name: '',
      planned: 'false',
      type: 'Road',
      antennaType: 'double',
      cameraDistance: 2,
      cameraEnable: 1,
      collectionmode: 'oneway',
      dmiType: 'mechanical',
      drivingspeed: 8,
      ntripEnable: 'true',
      positionSatellites: [],
      scannerPointPerSecond: tables.settings[0].pts,
      scannerRange: tables.settings[0].mr,
      scannerRotationSpeed: tables.settings[0].rps,
      scannerScanlineSpacing: 4,
      positionAccuracy: 5,
    }
  })

  afterEach(() => {})

  /** disabled, now it's read only
  test('Should update values when changing drivingspeed', () => {
    let result
    result = getJobValuesToUpdate('drivingspeed', 30, values, unit, 'ZF')
    expect(result).toEqual({
      scannerScanlineSpacing: 16,
    })
    result = getJobValuesToUpdate('drivingspeed', 120, values, unit, 'ZF')
    expect(result).toEqual({
      cameraDistance: 4,
      scannerScanlineSpacing: 66,
    })
  })
  */

  test('Should update values when changing camera distance', () => {
    let result
    result = getJobValuesToUpdate('cameraDistance', 5, values, 'ZF', tables)
    expect(result).toEqual({})
    result = getJobValuesToUpdate('cameraDistance', 1, values, 'ZF', tables)
    expect(result).toEqual({})
  })

  test('Should update values when changing scanline spacing', () => {
    let result
    result = getJobValuesToUpdate(
      'scannerScanlineSpacing',
      5,
      values,
      'ZF',
      tables
    )
    expect(result).toEqual({
      drivingspeed: 10,
    })
    result = getJobValuesToUpdate(
      'scannerScanlineSpacing',
      1,
      values,
      'ZF',
      tables
    )
    expect(result).toEqual({
      drivingspeed: 2,
    })
  })

  test('Should ignore camera spacing when camera is off', () => {
    let result
    const valuesLoc: FlatJob = { ...values, cameraEnable: 0 }
    result = getJobValuesToUpdate(
      'scannerScanlineSpacing',
      50,
      valuesLoc,
      'ZF',
      tables
    )
    expect(result).toEqual({
      drivingspeed: 95,
    })
    result = getJobValuesToUpdate(
      'scannerRotationSpeed',
      267,
      values,
      'ZF',
      tables
    )
    expect(result).toEqual({
      drivingspeed: 38,
    })
  })

  test('Should update speed when changing cameraEnable', () => {
    let result
    const valuesLoc: FlatJob = {
      ...values,
      cameraEnable: 0,
      scannerScanlineSpacing: 30,
    }
    result = getJobValuesToUpdate('cameraEnable', 1, valuesLoc, 'ZF', tables)
    expect(result).toEqual({
      drivingspeed: 50,
    })
    result = getJobValuesToUpdate('cameraEnable', 0, valuesLoc, 'ZF', tables)
    expect(result).toEqual({
      drivingspeed: 57,
    })
  })

  test('Should update values when changing rotation speed', () => {
    const result = getJobValuesToUpdate(
      'scannerRotationSpeed',
      214,
      values,
      'ZF',
      tables
    )
    expect(result).toEqual({
      drivingspeed: 31,
      scannerPointPerSecond: tables.settings[9].pts,
      scannerRange: tables.settings[9].mr,
    })
  })

  test('Should update values when changing scanner points per second', () => {
    const valuesLoc: FlatJob = {
      ...values,
      drivingspeed: 31,
      cameraDistance: 2,
      scannerPointPerSecond: tables.settings[9].pts,
      scannerRange: tables.settings[9].mr,
      scannerRotationSpeed: tables.settings[9].rps,
      scannerScanlineSpacing: 4,
    }
    const result = getJobValuesToUpdate(
      'scannerPointPerSecond',
      547000,
      valuesLoc,
      'ZF',
      tables
    )
    expect(result).toEqual({
      drivingspeed: 8,
      scannerRotationSpeed: tables.settings[0].rps,
      scannerRange: tables.settings[0].mr,
    })
  })

  test('Should update values when changing scanner range', () => {
    const result = getJobValuesToUpdate(
      'scannerRange',
      212,
      values,
      'ZF',
      tables
    )
    expect(result).toEqual({
      drivingspeed: 15,
      scannerPointPerSecond: tables.settings[6].pts,
      scannerRotationSpeed: tables.settings[6].rps,
    })
  })

  test('Should update max speed when changing rotation speed', () => {
    const result = getJobValuesToUpdate(
      'scannerRotationSpeed',
      267,
      values,
      'ZF',
      tables
    )
    expect(result.drivingspeed).toEqual(38)
  })
})

// BE works with metric values only
/* describe('Job Form Linked Values Interconnection (imperial)', () => {
  const unit = 'imperial'
  let values: FlatJob
  beforeEach(() => {
    values = {
      name: '',
      planned: 'false',
      type: 'Road',
      antennaType: 'double',
      cameraDistance: 6,
      cameraEnable: 1,
      collectionmode: 'oneway',
      dmiType: 'mechanical',
      drivingspeed: 1,
      ntripEnable: 'true',
      positionSatellites: [],
      scannerPointPerSecond: tables.settings[1].pts,
      scannerRange: tables.settings[1].mr,
      scannerRotationSpeed: tables.settings[0].rps, // TODO: this refers to a wrong value for this line in the table
      scannerScanlineSpacing: 1,
      positionAccuracy: 2,
    }
  })

  afterEach(() => {})

  test('Should update values when changing camera distance', () => {
    let result
    result = getJobValuesToUpdate(
      'cameraDistance',
      16,
      values,
      unit,
      'ZF',
      tables
    )
    expect(result).toEqual({
      drivingspeed: 3,
    })
    result = getJobValuesToUpdate(
      'cameraDistance',
      3,
      values,
      unit,
      'ZF',
      tables
    )
    expect(result).toEqual({
      drivingspeed: 3,
    })
  })

  test('Should update values when changing scanline spacing', () => {
    let result
    result = getJobValuesToUpdate(
      'scannerScanlineSpacing',
      2,
      values,
      unit,
      'ZF',
      tables
    )
    expect(result).toEqual({
      drivingspeed: 6,
    })
    result = getJobValuesToUpdate(
      'scannerScanlineSpacing',
      1,
      values,
      unit,
      'ZF',
      tables
    )
    expect(result).toEqual({
      drivingspeed: 3,
    })
  })

  test('Should update values when changing rotation speed', () => {
    let result
    result = getJobValuesToUpdate(
      'scannerRotationSpeed',
      50,
      values,
      unit,
      'ZF',
      tables
    )
    expect(result).toEqual({
      scannerRange: tables.settings[0].mr,
      drivingspeed: 3,
    })
    result = getJobValuesToUpdate(
      'scannerRotationSpeed',
      150,
      values,
      unit,
      'ZF',
      tables
    )
    expect(result).toEqual({
      scannerPointPerSecond: 500000,
      scannerRange: tables.settings[2].mr,
      drivingspeed: 9,
    })
  })

  test('Should update values when changing scanner points per second', () => {
    const result = getJobValuesToUpdate(
      'scannerPointPerSecond',
      500000,
      values,
      unit,
      'ZF',
      tables
    )
    expect(result).toEqual({
      scannerRotationSpeed: 150,
      scannerRange: tables.settings[2].mr,
      drivingspeed: 9,
    })
  })

  test('Should update values when changing scanner range', () => {
    let result
    result = getJobValuesToUpdate(
      'scannerRange',
      tables.settings[0].mr,
      values,
      unit,
      'ZF',
      tables
    )
    expect(result).toEqual({
      drivingspeed: 3,
    })
    result = getJobValuesToUpdate(
      'scannerRange',
      tables.settings[2].mr,
      values,
      unit,
      'ZF',
      tables
    )
    expect(result).toEqual({
      scannerPointPerSecond: 500000,
      scannerRotationSpeed: 150,
      drivingspeed: 9,
    })
  })

  test('Should update max speed when changing rotation speed', () => {
    const result = getJobValuesToUpdate(
      'scannerRotationSpeed',
      250,
      values,
      unit,
      'ZF',
      tables
    )
    // now with scanlinespacing at 1 it will take always the lower value, so it remains 1 and is not in the updated values
    expect(result.scannerScanlineSpacing).toBeUndefined()
  })
})
 */
