/* eslint-disable @typescript-eslint/no-explicit-any */
import { waitFor } from '@testing-library/react'
import { store } from 'store'
import {
  selectResponsiveness,
  systemResponsivenessActions,
} from 'store/features/system/slice'
import { mockStore } from 'store/mock/mockStoreTests'

beforeAll(() => {
  jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn())
})

describe('Responsiveness saga', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('responsiveness values should be set to critical when the responsiveness API fails', async () => {
    await waitFor(
      () => {
        store.dispatch(
          systemResponsivenessActions.success(mockStore.system.responsiveness)
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        store.dispatch(systemResponsivenessActions.failure())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const responsiveness = await selectResponsiveness(state)
    expect(responsiveness!.system).toStrictEqual(
      expect.objectContaining({
        details: expect.objectContaining({
          cpu: expect.objectContaining({
            critical: true,
          }),
          gpu: expect.objectContaining({
            critical: true,
          }),
          ram: expect.objectContaining({
            critical: true,
          }),
        }),
      })
    )
    expect(responsiveness!.connection).toStrictEqual(
      expect.objectContaining({
        critical: true,
        internet: expect.objectContaining({
          health: 0,
        }),
        gateway: expect.objectContaining({
          health: 0,
        }),
      })
    )
    expect(responsiveness!.battery).toBeFalsy()
    expect(responsiveness!.storage).toBeFalsy()
  })
})
