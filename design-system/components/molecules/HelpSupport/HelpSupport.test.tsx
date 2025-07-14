import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { queries, RenderResult } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { HelpSupport } from './HelpSupport'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('HelpSupport (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    /** mock the anchor element */
    const mockAnchorEl = document.createElement('div')
    mockAnchorEl.innerHTML = '<div id="hamburgerMenu">---</div>'
    document.body.appendChild(mockAnchorEl)
    /** render teh component */
    component = renderWithProvider(<HelpSupport />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})
