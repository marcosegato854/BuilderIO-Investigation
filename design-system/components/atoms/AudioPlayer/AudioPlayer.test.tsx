import { queries, RenderResult } from '@testing-library/react'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import { AudioPlayer, IAudioPlayerProps } from './AudioPlayer'

const defaultProps: IAudioPlayerProps = {
  src: 'https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('AudioPlayer (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<AudioPlayer src={defaultProps.src} />)(
      mockedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})
