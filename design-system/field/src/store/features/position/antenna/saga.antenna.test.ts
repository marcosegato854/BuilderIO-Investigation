/* eslint-disable @typescript-eslint/no-explicit-any */
import { waitFor } from '@testing-library/react'
import { Store } from 'redux'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import {
  mkAntennaCalculate,
  mkAntennaClientSettings,
  mkAntennaClientSettingsUpdate,
} from 'store/features/camera/mockApi'
import {
  cameraCalculateAntenna2LeverarmActions,
  cameraGet2ndAntennaClientSettingsActions,
  cameraUpdate2ndAntennaClientSettingsActions,
} from 'store/features/camera/slice'
import { AntennaClientSettings } from 'store/features/camera/types'

// const antennaSettings: AntennaSettings = {
//   enabled: true,
//   leverarm: {
//     x: 15,
//     y: 18,
//     z: 155,
//   },
// }
const antennaCoords: AntennaClientSettings = {
  pixel: { x: 5, y: 8 },
  distance: 1500,
}
const calculatedLeverArm: LeverArm = {
  x: 154,
  y: 11,
  z: 15,
}

describe('Position saga', () => {
  let mockGetAntennaClientSettingsAPI: jest.SpyInstance<any>
  let mockUpdateAntennaClientSettingsAPI: jest.SpyInstance<any>
  let mockCalculateAntennaLeverarmAPI: jest.SpyInstance<any>
  let store: Store

  beforeEach(async () => {
    store = getTestingStore()
    mockGetAntennaClientSettingsAPI = mkAntennaClientSettings(antennaCoords)
    mockUpdateAntennaClientSettingsAPI =
      mkAntennaClientSettingsUpdate(antennaCoords)
    mockCalculateAntennaLeverarmAPI = mkAntennaCalculate(calculatedLeverArm)
    // enable fake timers
    jest.useFakeTimers()
  })

  afterEach(async () => {
    mockGetAntennaClientSettingsAPI.mockClear()
    mockUpdateAntennaClientSettingsAPI.mockClear()
    mockCalculateAntennaLeverarmAPI.mockClear()
    jest.useRealTimers()
  })

  it('should call the get settings API when dispatching an action', async () => {
    await waitFor(
      () => {
        store.dispatch(cameraGet2ndAntennaClientSettingsActions.request())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockGetAntennaClientSettingsAPI).toHaveBeenCalled()
  })

  it('should call the update settings API when dispatching an action', async () => {
    await waitFor(
      () => {
        store.dispatch(
          cameraUpdate2ndAntennaClientSettingsActions.request(antennaCoords)
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockUpdateAntennaClientSettingsAPI).toHaveBeenCalledWith(
      antennaCoords
    )
  })

  it('should call the calculate leverarm API when dispatching an action', async () => {
    await waitFor(
      () => {
        store.dispatch(
          cameraCalculateAntenna2LeverarmActions.request(antennaCoords)
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockCalculateAntennaLeverarmAPI).toHaveBeenCalledWith(antennaCoords)
  })
})
