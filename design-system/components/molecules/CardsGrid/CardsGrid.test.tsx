import { queries, RenderResult } from '@testing-library/react'
import {
  CardsGrid,
  GridVariant,
} from 'components/molecules/CardsGrid/CardsGrid'
import { IJobGridItemProps } from 'components/molecules/JobGridItem/JobGridItem'
import { IProjectGridItemProps } from 'components/molecules/ProjectGridItem/ProjectGridItem'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

const project: IProject = {
  disk: 'p',
  name: 'England',
  jobs: 20,
  // image,
  completed: 10,
}

const job: IJob = {
  name: 'NewJob',
  creationdate: '2021-05-17T09:55:58Z',
  scans: 0,
  size: 0,
}

const kebabOptions: Array<IClickableOption> = [
  {
    onClick: () => console.info('edit project clicked'),
    value: 'edit',
    label: 'Edit Project',
  },
  {
    onClick: () => console.info('delete project clicked'),
    value: 'delete',
    label: 'Delete Project',
  },
  {
    onClick: () => console.info('view settings clicked'),
    value: 'view',
    label: 'View Settings',
  },
]

const projectItems: IProjectGridItemProps[] = Array(5)
  .fill(-1)
  .map((i, index) => ({
    kebabOptions,
    project: { ...project, name: `${project.name}${index}` },
  }))

const jobItems: IJobGridItemProps[] = Array(8)
  .fill(-1)
  .map((i, index) => ({
    kebabOptions,
    job: { ...job, name: `${job.name}${index}` },
  }))

describe('CardsGrid (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<CardsGrid items={projectItems} />)(
      mockedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should display Grid items by default', () => {
    const gridItems = component.getAllByTestId('project-grid-item')
    expect(gridItems.length).toBe(projectItems.length)
  })
})

describe('CardsGrid (mockStore listview)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <CardsGrid items={projectItems} viewBy={GridVariant.ListView} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should display List items with variant prop', () => {
    const listItems = component.getAllByTestId('project-list-item')
    expect(listItems.length).toBe(projectItems.length)
  })
})

describe('CardsGrid (mockStore listview jobs)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <CardsGrid items={jobItems} viewBy={GridVariant.ListView} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should display the correct Card type based on item type', () => {
    const listItem = component.getAllByTestId('job-list-item')
    expect(listItem.length).toBe(jobItems.length)
  })
})

describe('CardsGrid (mockStore listview project search)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <CardsGrid
        items={projectItems}
        viewBy={GridVariant.ListView}
        search="england2"
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should filter items by name case insensitive', () => {
    const listItems = component.getAllByTestId('project-list-item')
    expect(listItems.length).toBe(1)
  })
})
