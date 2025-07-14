import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { queries, RenderResult } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { ErrorItem } from 'components/atoms/ErrorItem/ErrorItem'
import style from './ErrorItem.module.scss'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('ErrorItem (mockStore) - error', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <ErrorItem title="test" datetime="now" type="Error" />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('it should display title', () => {
    const title = component.getByTestId('title-error-item')
    expect(title).toHaveTextContent('test')
  })

  test('it should display date', () => {
    const date = component.getByTestId('date-error-item')
    expect(date).toHaveTextContent('now')
  })

  test('it should display icon', () => {
    const icon = component.getByTestId('icon-error-item')
    expect(icon).toBeTruthy()
  })

  test('it should has error type', () => {
    const errorClass = component.container.getElementsByClassName(
      style.erroritem
    )
    expect(errorClass).toBeTruthy()
  })
})

describe('ErrorItem (mockStore) - warning', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <ErrorItem title="test" time="now" type="Warning" datetime="date" />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('it should has warning type', () => {
    const warningClass = component.container.getElementsByClassName(
      style.warningitem
    )
    expect(warningClass).toBeTruthy()
  })
})
