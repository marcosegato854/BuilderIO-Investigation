import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { queries, RenderResult } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { ItemDetails } from 'components/atoms/ItemDetails/ItemDetails'
import { getDetails } from 'utils/jobs'
import { mergeDeepRight } from 'ramda'
import { t } from 'i18n/config'
import { labelWithUnit, mtToFt } from 'utils/numbers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

const job = mockStore.dataStorageService.currentJob
const project = mockStore.dataStorageService.currentProject

describe('ItemDetails (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<ItemDetails details={[]} />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should NOT display tolerance if RTK is OFF', () => {
    const jobWithoutRTK = mergeDeepRight(job, {
      ntrip: {
        enable: false,
      },
    }) as IJob
    const details = getDetails(jobWithoutRTK, 'metric')
    expect(
      details.find(
        (s) => s.primary === t('job_browser.details.position', 'wrong')
      )
    ).not.toBeTruthy()
  })

  test('Should display tolerance if RTK is ON', () => {
    const jobWithoutRTK = mergeDeepRight(job, {
      ntrip: {
        enable: true,
      },
    }) as IJob
    const details = getDetails(jobWithoutRTK, 'metric')
    expect(
      details.find(
        (s) => s.primary === t('job_browser.details.position', 'wrong')
      )
    ).toBeTruthy()
  })

  test('Should display scanner range correctly', () => {
    const details = getDetails(job, 'metric')
    const value = details.find(
      (s) => s.primary === t('job_browser.details.scanner', 'wrong')
    )!.secondary
    const expected = labelWithUnit(
      'M',
      mtToFt,
      job.scanner.range,
      project.unit
    ).toString()
    expect(value).toContain(expected)
  })
})
