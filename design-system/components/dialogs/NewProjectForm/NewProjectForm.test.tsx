/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import {
  queries,
  RenderResult,
  fireEvent,
  waitFor,
  screen,
} from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { store } from 'store'
import NewProjectForm from 'components/dialogs/NewProjectForm/NewProjectForm'
import { t } from 'i18n/config'
import { resetStoreAction } from 'store/features/global/slice'
import { dataStorageAvailableDisksActions } from 'store/features/dataStorage/slice'
import { storageUnitHandler } from 'utils/numbers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

const project = mockStore.dataStorageService.currentProject!

describe('ContextualHelp (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<NewProjectForm initialValues={project} />)(
      mockedStore
    )
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display project title', () => {
    expect(component.getByDisplayValue(project.name)).toBeTruthy()
  })

  test('It should send the image to the API', async () => {
    const submitButton = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(submitButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          project: expect.objectContaining({
            image: project.image,
          }),
        }),
      })
    )
  })

  test('It should remove the image when clicking the delete button', async () => {
    expect(
      component.getByText(t('new_job_form.delete_thumbnail', 'wrong') as string)
    ).toBeTruthy()
    const deleteButton = component.getByTestId('delete-button')
    await waitFor(
      () => {
        fireEvent.click(deleteButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const submitButton = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(submitButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          project: expect.objectContaining({
            image: null,
          }),
        }),
      })
    )
    expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument()
    expect(
      component.getByText(t('new_job_form.add_a_thumbnail', 'wrong') as string)
    ).toBeTruthy()
  })

  test('It should show the disk slot if available', () => {
    const disk: IDisk = mockStore.dataStorageService.disks[0]
    expect(
      component.getByText(
        `${t('project_browser.slot', 'Wrong')} ${
          disk.slot
        } (${storageUnitHandler(Number(disk.available))}/${storageUnitHandler(
          Number(disk.total)
        )})`
      )
    ).toBeTruthy()
  })

  test('It should fallback to disk name if slot is not available', () => {
    const disk: IDisk = mockStore.dataStorageService.disks[1]
    expect(
      component.getByText(
        `${disk.name} (${storageUnitHandler(
          Number(disk.available)
        )}/${storageUnitHandler(Number(disk.total))})`
      )
    ).toBeTruthy()
  })

  test('It should NOT pass validation if the project name is shorter than 3 chars', async () => {
    const shortName = 'xy'
    const nameField = component.getByTestId('project-name-input')
    // enter the short name
    const input: HTMLInputElement = nameField.getElementsByTagName('input')[0]
    fireEvent.change(input, { target: { value: shortName } })
    // change focus to activate validation
    fireEvent.blur(input)
    await waitFor(
      () => {
        fireEvent.focus(input)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(
      component.getByText(
        t('new_project_form.validation.min3', 'wrong') as string
      )
    ).toBeTruthy()
  })

  test('It should NOT pass validation if the project name is longer than 25 chars', async () => {
    const longName = 'ThisIsAVeryTooLongProjectName'
    const nameField = component.getByTestId('project-name-input')
    // enter the long name
    const input: HTMLInputElement = nameField.getElementsByTagName('input')[0]
    fireEvent.change(input, { target: { value: longName } })
    // change focus to activate validation
    fireEvent.blur(input)
    await waitFor(
      () => {
        fireEvent.focus(input)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(
      component.getByText(
        t('new_project_form.validation.max', 'wrong') as string
      )
    ).toBeTruthy()
  })

  test('It should NOT pass validation if the project name does not match the regex', async () => {
    const wrongName = 'ThisIsA-*-wrongProjectName'
    const nameField = component.getByTestId('project-name-input')
    // enter the wrong name
    const input: HTMLInputElement = nameField.getElementsByTagName('input')[0]
    fireEvent.change(input, { target: { value: wrongName } })
    // change focus to activate validation
    fireEvent.blur(input)
    await waitFor(
      () => {
        fireEvent.focus(input)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(
      component.getByText(
        t('new_project_form.validation.bad_characters', 'wrong') as string
      )
    ).toBeTruthy()
  })
})

describe('NewProjectForm (Store)', () => {
  let component: RenderResult<typeof queries>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>

  beforeEach(async () => {
    mockDispatchRealStore = jest.spyOn(store, 'dispatch')
    jest.spyOn(global, 'fetch').mockResolvedValue({
      text: jest.fn().mockResolvedValue(''),
    } as any)
    jest.useFakeTimers()
    component = renderWithProvider(<NewProjectForm />)(store)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    mockDispatchRealStore.mockClear()
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should show the disk selector', () => {
    const diskSelect = component.getByTestId('disk-select')
    expect(diskSelect).toBeTruthy()
  })

  test('It should show the correct number of disks', async () => {
    // the store in the test is empty at init
    const diskSelectEntriesInit =
      component.queryAllByTestId('disk-select-entry')
    expect(diskSelectEntriesInit.length).toBe(0)

    // dispatch a disk availabilty change
    await waitFor(
      () => {
        store.dispatch(
          dataStorageAvailableDisksActions.success({
            disks: mockStore.dataStorageService.disks,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)

    // check for the updated number of entries
    const diskSelectEntries = component.queryAllByTestId('disk-select-entry')
    expect(diskSelectEntries.length).toBe(
      mockStore.dataStorageService.disks.length
    )
  })
})
