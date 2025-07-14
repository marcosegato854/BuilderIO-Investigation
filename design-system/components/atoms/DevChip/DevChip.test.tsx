import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { queries, RenderResult } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { DevChip } from 'components/atoms/DevChip/DevChip'
import { mergeDeepRight } from 'ramda'

describe('DevChip (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {})

  afterEach(() => {})

  test('It should mount', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockedStore: any = configureMockStore()(mockStore)
    component = renderWithProvider(<DevChip />)(mockedStore)
    expect(component).toBeTruthy()
  })

  test('It should display if the FE is in development mode', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockedStore: any = configureMockStore()(
      mergeDeepRight(mockStore, {
        system: {
          releaseTag: 'Develop',
          info: {
            softwareBuildType: 'Release',
          },
        },
      })
    )
    component = renderWithProvider(<DevChip />)(mockedStore)
    expect(component.container).toHaveTextContent(/DEV/)
  })

  test('It should display if the FE is in development mode (missing BE)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockedStore: any = configureMockStore()(
      mergeDeepRight(mockStore, {
        system: {
          releaseTag: 'Develop',
          info: {
            softwareBuildType: 'Release',
          },
        },
      })
    )
    component = renderWithProvider(<DevChip />)(mockedStore)
    expect(component.container).toHaveTextContent(/DEV/)
  })

  test('It should display if the BE is in development mode', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockedStore: any = configureMockStore()(
      mergeDeepRight(mockStore, {
        system: {
          releaseTag: 'Release',
          info: {
            softwareBuildType: 'Develop',
          },
        },
      })
    )
    component = renderWithProvider(<DevChip />)(mockedStore)
    expect(component.container).toHaveTextContent(/DEV/)
  })

  test('It NOT should display if everything is in release mode', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockedStore: any = configureMockStore()(
      mergeDeepRight(mockStore, {
        system: {
          releaseTag: 'Release',
          info: {
            softwareBuildType: 'Release',
          },
        },
      })
    )
    component = renderWithProvider(<DevChip />)(mockedStore)
    expect(component.container).not.toHaveTextContent(/DEV/)
  })

  test('It NOT should display because the BE release info is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockedStore: any = configureMockStore()(
      mergeDeepRight(mockStore, {
        system: {
          releaseTag: 'Release',
          info: {
            softwareBuildType: null,
          },
        },
      })
    )
    component = renderWithProvider(<DevChip />)(mockedStore)
    expect(component.container).not.toHaveTextContent(/DEV/)
  })
})
