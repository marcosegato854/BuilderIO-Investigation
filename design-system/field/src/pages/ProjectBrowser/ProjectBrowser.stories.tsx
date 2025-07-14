import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import {
  ProjectBrowser,
  IProjectBrowserProps,
} from 'pages/ProjectBrowser/ProjectBrowser'

const mockedStore = configureMockStore()(mockStore)

export default {
  title: 'Pages/ProjectBrowser',
  component: ProjectBrowser,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
  args: {},
} as Meta

// const Template: Story<IProjectBrowserProps> = (args) => {
//   return <ProjectBrowser {...args} />
// }

/**
 * Pages need the MemoryRouter to simulate ConnectedRouter
 */
const Template: Story<IProjectBrowserProps> = (args) => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Route
        component={(routerProps: RouteComponentProps) => {
          return <ProjectBrowser {...args} {...routerProps} />
        }}
        path="/"
      />
    </MemoryRouter>
  )
}

export const Default = Template.bind({})
Default.args = {}

const TemplateMockStore: Story = (args) => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Route
        component={(routerProps: RouteComponentProps) => {
          return (
            <Provider store={mockedStore}>
              <ProjectBrowser {...args} {...routerProps} />
            </Provider>
          )
        }}
        path="/"
      />
    </MemoryRouter>
  )
}

export const MockStore = TemplateMockStore.bind({})
Default.args = {}
