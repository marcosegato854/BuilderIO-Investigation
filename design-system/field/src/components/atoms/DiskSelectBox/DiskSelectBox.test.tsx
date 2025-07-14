import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { queries, RenderResult } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { DiskSelectBox } from './DiskSelectBox'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

enum TestOptionValue {
  Value1 = 'disk1',
  Value2 = 'disk2',
  Value3 = 'disk3',
}

const value: string = TestOptionValue.Value2
const defaultOptions: IOptionDisk[] = [
  {
    value: TestOptionValue.Value1,
    label: 'Disk 1',
    critical: true,
  },
  {
    value: TestOptionValue.Value2,
    label: 'Disk 2',
    critical: false,
  },
  {
    value: TestOptionValue.Value3,
    label: 'Disk 3',
    critical: true,
  },
]

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('DiskSelectBox (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <DiskSelectBox value={value} options={defaultOptions} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})
