import { queries, RenderResult, screen } from '@testing-library/react'
import { JobListItem } from 'components/molecules/JobListItem/JobListItem'
import { t } from 'i18n/config'
import { mergeDeepRight } from 'ramda'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { underscores } from 'utils/strings'
import { renderWithProvider } from 'utils/test'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('JobListItem SU (mockStore)', () => {
  let component: RenderResult<typeof queries>
  const jobWithSU = mergeDeepRight(mockStore.dataStorageService.currentJob, {
    hardwareModel: 'PEGASUS TRK500 NEO',
  }) as IJob

  beforeEach(() => {
    component = renderWithProvider(<JobListItem job={jobWithSU} />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display the SU model', () => {
    expect(component.getByTestId('su-model')).toBeTruthy()
  })

  test('It should translate the SU model', () => {
    expect(
      component.getByText(
        t(
          `su.model.${underscores(jobWithSU.hardwareModel!)}`,
          'Wrong'
        ) as string
      )
    ).toBeTruthy()
  })
})

describe('JobListItem NO SU (mockStore)', () => {
  let component: RenderResult<typeof queries>
  const jobWithoutSU = mergeDeepRight(mockStore.dataStorageService.currentJob, {
    hardwareModel: undefined,
  }) as IJob

  beforeEach(() => {
    component = renderWithProvider(<JobListItem job={jobWithoutSU} />)(
      mockedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should NOT display the SU model', () => {
    expect(screen.queryByTestId('su-model')).not.toBeInTheDocument()
  })
})
