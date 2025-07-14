import React from 'react'
import { renderWithProvider } from 'utils/test'
import { mockStore } from 'store/mock/mockStoreTests'
import configureMockStore from 'redux-mock-store'
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import { store } from 'store'
import moxios from 'moxios'
import apiClient from 'store/services/apiClientBackend'
import {
  dataStorageJobsActions,
  dataStorageProcessingStatusActions,
} from 'store/features/dataStorage/slice'
import { IJobBrowserProps, JobBrowser } from 'pages/JobBrowser/JobBrowser'
import { t } from 'i18n/config'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { ErrorManager } from 'components/organisms/ErrorManager/ErrorManager'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)
const currentProject = mockStore.dataStorageService.currentProject!
const currentJob = mockStore.dataStorageService.currentJob!
/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

const routeComponentPropsMock = {
  history: {
    location: {
      pathname: '/HomePage',
      key: 'default',
    },
  },
  location: {},
  match: {},
}

describe('JobBrowser (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <JobBrowser {...(routeComponentPropsMock as IJobBrowserProps)} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(screen.getByText('Pegasus')).toBeTruthy()
  })

  test('It displays the jobs', () => {
    const jobs = component.getAllByRole('cell')
    expect(jobs.length).toBe(2)
  })

  test('It dispatches new job form action when clicking the new job button', () => {
    const addNewButton = screen.getByTestId('red-plus-mobile')
    expect(addNewButton).toBeTruthy()
    fireEvent.click(addNewButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: {
        component: 'NewJobForm',
      },
      type: 'dialogs/OPEN_DIALOG',
    })
  })
})

describe('JobBrowser (realStore)', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    /** mock API */
    /* moxios.install(apiClient)
    moxios.stubRequest('/datastorage/projects/projectname/jobs', {
      status: 200,
      response: {
        projects: [
          {
            name: 'Milano1',
          },
          {
            name: 'Milano2',
          },
        ],
      },
    }) */
    // moxios.install(mockApiClient)
    moxios.stubRequest('/datastorage/projects/disk/projectname/jobs', {
      status: 200,
      response: {
        jobs: mockStore.dataStorageService.jobs,
      },
    })
    component = renderWithProvider(
      <div>
        <DialogManager />
        <ErrorManager />
        <JobBrowser {...(routeComponentPropsMock as IJobBrowserProps)} />
      </div>
    )(store)
  })

  afterEach(() => {
    moxios.uninstall(apiClient)
  })

  test('It should mount', () => {
    expect(screen.getByText('Pegasus')).toBeTruthy()
  })

  test('It displays the jobs', async () => {
    store.dispatch(
      dataStorageJobsActions.success({
        jobs: mockStore.dataStorageService.jobs,
      })
    )
    const jobs = await component.getAllByRole('cell')
    expect(jobs.length).toBe(2)
  })

  test('It filters the jobs', async () => {
    store.dispatch(
      dataStorageJobsActions.success({
        jobs: mockStore.dataStorageService.jobs,
      })
    )
    const searchInput = screen.getByTestId('search-input')
    expect(searchInput).toBeTruthy()
    fireEvent.change(searchInput, { target: { value: 'Job001' } })
    const jobs = await component.findAllByRole('cell')
    expect(jobs.length).toBe(1)
  })

  test('should alert if no space is available for processing (error inside the payload in the GET processing)', async () => {
    await waitFor(
      () => {
        store.dispatch(
          dataStorageProcessingStatusActions.success({
            currentProcess: [
              {
                disk: currentProject.disk,
                project: currentProject.name,
                job: currentJob.name,
                errors: [
                  {
                    code: 'LCB011',
                    description: 'disk error',
                    type: 2,
                  },
                ],
              },
            ],
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const dialogData: any = t('notifications.dataStorage.LCB011', {
      returnObjects: true,
    })
    const alert = screen.getByText(dialogData.title)
    expect(alert).toBeTruthy()
  })
})
