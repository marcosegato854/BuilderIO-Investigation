import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { queries, RenderResult } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { TrackList } from './TrackList'
import { mergeDeepRight } from 'ramda'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('TrackList (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <TrackList
        tracks={mockStore.planningService.undoablePolygons.present}
        onTrackSelection={() => {}}
        onInternalTrackSelection={() => {}}
        onTrackReorder={() => {}}
        onInternalTrackReorder={() => {}}
        onTrackChangeName={() => {}}
        onInternalTrackChangeName={() => {}}
        onTrackUpdateSettings={() => {}}
        onInternalTrackUpdateSettings={() => {}}
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

describe('TrackList (mockStore) flip icon during acquisition', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {})

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should show the flip icon on the next track if autocapture is ON', () => {
    const mockedAcOnStore: any = configureMockStore()(
      mergeDeepRight(mockStore, {
        system: {
          systemState: { state: 'Logging' },
        },
        routingService: {
          autocaptureStatus: {
            enabled: true,
          },
        },
      })
    )
    component = renderWithProvider(
      <TrackList
        tracks={mockStore.routingService.autocapturePolygons}
        onTrackSelection={() => {}}
        onInternalTrackSelection={() => {}}
        onTrackReorder={() => {}}
        onInternalTrackReorder={() => {}}
        onTrackChangeName={() => {}}
        onInternalTrackChangeName={() => {}}
        onTrackUpdateSettings={() => {}}
        onInternalTrackUpdateSettings={() => {}}
        isAcquisition={true}
      />
    )(mockedAcOnStore)
    expect(component).toBeTruthy()
    expect(component.getByTestId('flip-button')).toBeTruthy()
  })

  test('It should NOT show the flip icon on the next track if autocapture is OFF', () => {
    const mockedAcOffStore: any = configureMockStore()(
      mergeDeepRight(mockStore, {
        system: {
          systemState: { state: 'Logging' },
        },
        routingService: {
          autocaptureStatus: {
            enabled: false,
          },
        },
      })
    )
    component = renderWithProvider(
      <TrackList
        tracks={mockStore.routingService.autocapturePolygons}
        onTrackSelection={() => {}}
        onInternalTrackSelection={() => {}}
        onTrackReorder={() => {}}
        onInternalTrackReorder={() => {}}
        onTrackChangeName={() => {}}
        onInternalTrackChangeName={() => {}}
        onTrackUpdateSettings={() => {}}
        onInternalTrackUpdateSettings={() => {}}
        isAcquisition={true}
      />
    )(mockedAcOffStore)
    expect(component).toBeTruthy()
    expect(component.queryByTestId('flip-button')).not.toBeTruthy()
  })
})
