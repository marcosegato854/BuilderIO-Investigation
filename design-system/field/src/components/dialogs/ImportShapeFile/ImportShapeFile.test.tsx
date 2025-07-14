import {
  fireEvent,
  queries,
  RenderResult,
  screen,
} from '@testing-library/react'
import ImportShapeFile from 'components/dialogs/ImportShapeFile/ImportShapeFile'
import { t } from 'i18n/config'
import configureMockStore from 'redux-mock-store'
import { closeDialogAction } from 'store/features/dialogs/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import React from 'react'
import {
  importShpStartActions,
  listShpStartActions,
} from 'store/features/planning/slice'
import { getType } from 'typesafe-actions'
import { mergeDeepRight } from 'ramda'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStoreNoShpList: any = configureMockStore()(
  mergeDeepRight(mockStore, {
    planningService: {
      shpList: null,
    },
  })
)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('ImportShapeFile (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<ImportShapeFile />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should call a close action when clicking cancel', () => {
    const cancelButton = component.getByText(
      t('import_shape.cancel', 'cancel') as string
    )
    fireEvent.click(cancelButton)
    expect(mockDispatch).toHaveBeenCalledWith(closeDialogAction())
  })

  test('Upload button should be deactivated if no shp file is selected', () => {
    const uploadButton = component.getByTestId('upload-button')
    expect(uploadButton).toHaveAttribute('disabled')
  })

  test('Should display the refresh button', () => {
    const refreshButton = component.getByText(
      t('import_shape.refresh', 'wrong') as string
    )
    expect(refreshButton).toBeTruthy()
    expect(refreshButton).not.toHaveAttribute('disabled')
  })

  test('It should NOT call the upload action when clicking on the upload button without selection', () => {
    const uploadButton = component.getByText(
      t('import_shape.upload', 'upload') as string
    )
    fireEvent.click(uploadButton)
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: getType(importShpStartActions.request) })
    )
  })

  test('It should call the upload action when clicking on the upload button', () => {
    const firstItem = component.getByTestId('import-shape-row-0')
    fireEvent.click(firstItem)
    const uploadButton = component.getByText(
      t('import_shape.upload', 'upload') as string
    )
    fireEvent.click(uploadButton)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: getType(importShpStartActions.request) })
    )
  })

  test('It should call the load list action when clicking on the refresh button', () => {
    const refreshButton = component.getByTestId('refresh-button')
    fireEvent.click(refreshButton)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: getType(listShpStartActions.request) })
    )
  })

  test('It should NOT display the loading spinner', () => {
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
  })
})

describe('ImportShapeFile (mockStore) before loading shp list', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<ImportShapeFile />)(mockedStoreNoShpList)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display the loading spinner', () => {
    expect(component.getByTestId('spinner')).toBeTruthy()
  })

  test('It should NOT display the list', () => {
    expect(screen.queryByTestId('import-shp-list')).not.toBeInTheDocument()
  })

  test('Should disable the refresh button', () => {
    const refreshButton = component.getByTestId('refresh-button')
    expect(refreshButton).toHaveAttribute('disabled')
  })
})
