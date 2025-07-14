/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  RenderResult,
  fireEvent,
  queries,
  waitFor,
} from '@testing-library/react'
import image from 'assets/jpg/England2.jpg'
import { ProjectListItem } from 'components/molecules/ProjectListItem/ProjectListItem'
import { Store } from 'redux'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import {
  dataStorageProcessingStatusActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { DataStorageProcessingInfo } from 'store/features/dataStorage/types'
import { resetStoreAction } from 'store/features/global/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'

const project: IProject = {
  disk: 'p',
  name: 'NewProject',
  jobs: 20,
  image,
  completed: 10,
}

const projectProcess: IProject = {
  disk: 'p',
  name: 'Project002',
  jobs: 20,
  image,
  completed: 10,
}

describe('ProjectListItem (store)', () => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  let store: Store
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>

  beforeEach(async () => {
    store = getTestingStore()
    mockDispatchRealStore = jest.spyOn(store, 'dispatch')
    // enable fake timers
    jest.useFakeTimers()
    // fill the store
    await waitFor(
      () => {
        // fill current project
        store.dispatch(
          dataStorageProjectDetailActions.success(
            mockStore.dataStorageService.currentProject!
          )
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(async () => {
    await waitFor(
      () => {
        store.dispatch(resetStoreAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    mockDispatchRealStore.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    component = renderWithProvider(<ProjectListItem project={project} />)(store)
    expect(component).toBeTruthy()
  })

  test('It should call a function on click with image', () => {
    component = renderWithProvider(<ProjectListItem project={project} />)(store)
    const clickable = component.getByTestId('clickable-image')
    fireEvent.click(clickable)
    expect(mockDispatchRealStore).toHaveBeenCalledWith(
      expect.objectContaining({
        type: '@@router/CALL_HISTORY_METHOD',
      })
    )
  })

  test('It should call a function on click without image', () => {
    component = renderWithProvider(
      <ProjectListItem project={{ ...project, image: 'asdfa' }} />
    )(store)
    const clickable = component.getByTestId('clickable-image')
    fireEvent.click(clickable)
    expect(mockDispatchRealStore).toHaveBeenCalledWith(
      expect.objectContaining({
        type: '@@router/CALL_HISTORY_METHOD',
      })
    )
  })

  test('It should call a function on click on title', () => {
    component = renderWithProvider(<ProjectListItem project={project} />)(store)
    const clickable = component.getByTestId('clickable-title')
    fireEvent.click(clickable)
    expect(mockDispatchRealStore).toHaveBeenCalledWith(
      expect.objectContaining({
        type: '@@router/CALL_HISTORY_METHOD',
      })
    )
  })

  test('It should NOT show the progress bar if the jobsAcquired is 0', () => {
    component = renderWithProvider(<ProjectListItem project={project} />)(store)
    expect(
      component.queryByTestId('project-completion-progress')
    ).not.toBeInTheDocument()
  })

  test('It should show the progress bar if the jobsAcquired is > 0)', () => {
    component = renderWithProvider(
      <ProjectListItem project={{ ...project, jobsAcquired: 2 }} />
    )(store)
    expect(component.getByTestId('project-completion-progress')).toBeTruthy()
  })

  test('It should show the processing spinner if one of the jobs is processing', async () => {
    const processing: DataStorageProcessingInfo = {
      currentProcess: mockStore.dataStorageService.processing,
    }
    await waitFor(
      () => {
        store.dispatch(dataStorageProcessingStatusActions.success(processing))
      },
      { timeout: 500 }
    )

    jest.advanceTimersByTime(500)
    component = renderWithProvider(
      <ProjectListItem project={projectProcess} />
    )(store)
    expect(component.getByTestId('project-processing-spinner')).toBeTruthy()
  })
})
