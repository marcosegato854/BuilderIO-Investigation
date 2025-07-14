/* eslint-disable @typescript-eslint/no-explicit-any */
import { waitFor } from '@testing-library/react'
import { Store } from 'redux'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import {
  mkAntennaCalculate,
  mkAntennaClientSettings,
} from 'store/features/camera/mockApi'
import { cameraCalculateAntenna2LeverarmActions } from 'store/features/camera/slice'
import { AntennaClientSettings } from 'store/features/camera/types'
import {
  mkGetAntennaSettings,
  mkUpdateAntennaSettings,
} from 'store/features/position/mockApi'
import {
  positionGet2ndAntennaSettingsActions,
  positionUpdate2ndAntennaSettingsActions,
  select2ndAntenna,
} from 'store/features/position/slice'
import { AntennaSettings } from 'store/features/position/types'

const antennaSettings: AntennaSettings = {
  enabled: true,
  leverarm: {
    x: 15,
    y: 18,
    z: 155,
  },
}
const antennaClientSettings: AntennaClientSettings = {
  distance: 2,
  pixel: { x: 100, y: 100 },
}
const antennaCoords = { pixel: { x: 5, y: 8 }, distance: 1500 }
const calculatedLeverArm: LeverArm = {
  x: 154,
  y: 11,
  z: 15,
}

describe('Position saga', () => {
  let mockGetAntennaSettingsAPI: jest.SpyInstance<any>
  let mockGetAntennaClientSettingsAPI: jest.SpyInstance<any>
  let mockUpdateAntennaSettingsAPI: jest.SpyInstance<any>
  let mockCalculateAntennaLeverarmAPI: jest.SpyInstance<any>
  let store: Store

  beforeEach(async () => {
    store = getTestingStore()
    mockGetAntennaSettingsAPI = mkGetAntennaSettings(antennaSettings)
    mockGetAntennaClientSettingsAPI = mkAntennaClientSettings(
      antennaClientSettings
    )
    mockUpdateAntennaSettingsAPI = mkUpdateAntennaSettings(antennaSettings)
    mockCalculateAntennaLeverarmAPI = mkAntennaCalculate(calculatedLeverArm)
    // enable fake timers
    jest.useFakeTimers()
  })

  afterEach(async () => {
    mockGetAntennaSettingsAPI.mockClear()
    mockUpdateAntennaSettingsAPI.mockClear()
    mockGetAntennaClientSettingsAPI.mockClear()
    mockCalculateAntennaLeverarmAPI.mockClear()
    jest.useRealTimers()
  })

  it('should call the get settings API when dispatching an action', async () => {
    await waitFor(
      () => {
        store.dispatch(positionGet2ndAntennaSettingsActions.request())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockGetAntennaSettingsAPI).toHaveBeenCalled()
  })

  it('should call the update settings API when dispatching an action', async () => {
    await waitFor(
      () => {
        store.dispatch(
          positionUpdate2ndAntennaSettingsActions.request(antennaSettings)
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockUpdateAntennaSettingsAPI).toHaveBeenCalledWith(antennaSettings)
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

  it('should update the antenna2 in the position store with the calculation result', async () => {
    await waitFor(
      () => {
        store.dispatch(
          cameraCalculateAntenna2LeverarmActions.request(antennaCoords)
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const antenna = select2ndAntenna(state)
    expect(antenna.leverarm).toBe(calculatedLeverArm)
  })
})
