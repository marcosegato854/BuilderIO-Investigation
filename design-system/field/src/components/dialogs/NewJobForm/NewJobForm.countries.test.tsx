/* eslint-disable @typescript-eslint/no-explicit-any */
import { queries, RenderResult, waitFor } from '@testing-library/react'
import NewJobForm from 'components/dialogs/NewJobForm/NewJobForm'
import { mergeDeepRight } from 'ramda'
import configureMockStore from 'redux-mock-store'
import { MapsCountry } from 'store/features/system/types'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import React from 'react'

const mockStoreInternational = mergeDeepRight(mockStore, {
  system: {
    info: {
      countryCode: MapsCountry.INTERNATIONAL,
    },
  },
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStoreInternational)

describe('NewJobForm (mockStore International)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(async () => {
    jest.useFakeTimers()
    await waitFor(
      () => {
        component = renderWithProvider(<NewJobForm />)(mockedStore)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should show the planning switch', () => {
    const planningSwitch = component.getByTestId('job-planning-switch')
    expect(planningSwitch).toBeTruthy()
  })
})
