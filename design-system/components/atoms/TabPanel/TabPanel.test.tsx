import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { queries, RenderResult } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { TabPanel, ITabPanelProps } from './TabPanel'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

const testData: ITabPanelProps = {
  value: 1,
  index: 1,
}

describe('TabPanel (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <TabPanel {...testData}>
        <div>
          <header>
            <h1>I'm the header of the content</h1>
          </header>
          <div>I'm the content of the Tab</div>
          <footer>
            <h6>And I'm the footer of this wonderful tab!</h6>
          </footer>
        </div>
      </TabPanel>
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})
