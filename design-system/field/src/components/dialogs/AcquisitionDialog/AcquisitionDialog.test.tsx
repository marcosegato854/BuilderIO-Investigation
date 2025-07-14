import React from 'react'
import { renderWithProvider } from 'utils/test'
import { mockStore } from 'store/mock/mockStoreTests'
import configureMockStore from 'redux-mock-store'
import { fireEvent, RenderResult, queries } from '@testing-library/react'
import { SystemNotificationType } from 'store/features/system/types'
import AcquisitionDialog from './AcquisitionDialog'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
const mockOkButtonClick = jest.fn()
mockedStore.dispatch = mockDispatch

describe('AcquisitionDialog (mockStore)', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(
      <AcquisitionDialog
        type={SystemNotificationType.ERROR}
        okButtonCallback={mockOkButtonClick}
        okButtonLabel="OK"
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
    mockOkButtonClick.mockClear()
  })

  test('It should mount', () => {
    expect(component.container).toBeTruthy()
  })

  test('Should call the callback when ok button il clicked', () => {
    const okButton = component.getByText('OK')
    expect(okButton).toBeTruthy()
    fireEvent.click(okButton)
    expect(mockOkButtonClick).toHaveBeenCalled()
  })
})
