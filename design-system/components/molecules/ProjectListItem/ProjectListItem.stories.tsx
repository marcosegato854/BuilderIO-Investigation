import { Meta, Story } from '@storybook/react'
import image from 'assets/jpg/England2.jpg'
import {
  IProjectListItemProps,
  ProjectListItem,
} from 'components/molecules/ProjectListItem/ProjectListItem'
import { mergeDeepRight } from 'ramda'
import React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import { mockStore } from 'store/mock/mockStoreTests'
import configureMockStore from 'redux-mock-store'

const project: IProject = {
  disk: 'p',
  name: 'England',
  jobs: 20,
  completed: 10,
  image,
  jobsAcquired: 4,
  coordinate: {
    automatic: true,
    name: 'WSG84',
    unit: 'metric',
  },
}

const defaultValue: IProjectListItemProps = {
  project,
}

export default {
  title: 'Molecules/ProjectListItem',
  component: ProjectListItem,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IProjectListItemProps> = (args) => {
  return <ProjectListItem {...args} />
}

export const Default = Template.bind({})
Default.args = defaultValue

const overrideProject = {
  image: undefined,
}
const processingProject = mergeDeepRight(
  mockStore.dataStorageService.currentProject!,
  overrideProject
) as IProject
const override = {}
const mergedStore = mergeDeepRight(mockStore, override)
const InitialValuesStoreProcessing = configureMockStore()(mergedStore)
const TemplateProcessing: Story<IProjectListItemProps> = (args) => {
  return (
    <Provider store={InitialValuesStoreProcessing}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <ProjectListItem
                {...args}
                project={processingProject}
                {...routerProps}
              />
            )
          }}
          path="/"
        />
      </MemoryRouter>
    </Provider>
  )
}

export const Processing = TemplateProcessing.bind({})
Processing.args = defaultValue
