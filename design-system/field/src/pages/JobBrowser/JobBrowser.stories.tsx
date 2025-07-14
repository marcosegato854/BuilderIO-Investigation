import React from 'react'
import { Story, Meta } from '@storybook/react'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import { JobBrowser, IJobBrowserProps } from 'pages/JobBrowser/JobBrowser'

export default {
  title: 'Pages/JobBrowser',
  component: JobBrowser,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
  args: {},
} as Meta

// const Template: Story<IJobBrowserProps> = (args) => {
//   return <JobBrowser {...args} />
// }

/**
 * Pages need the MemoryRouter to simulate ConnectedRouter
 */
const Template: Story<IJobBrowserProps> = (args) => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Route
        component={(routerProps: RouteComponentProps) => {
          return <JobBrowser {...args} {...routerProps} />
        }}
        path="/"
      />
    </MemoryRouter>
  )
}

export const Default = Template.bind({})
Default.args = {}
