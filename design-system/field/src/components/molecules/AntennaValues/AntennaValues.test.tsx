/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { queries, RenderResult } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { AntennaValues } from 'components/molecules/AntennaValues/AntennaValues'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('AntennaValues (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <AntennaValues
        distance="2"
        distanceFocusHandler={() => {}}
        leverArm={null}
        manual={false}
        manualLeverarmHandler={(c: any) => (e: any) => {}}
        setDistance={() => {}}
        userInteractionHandler={() => {}}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})
