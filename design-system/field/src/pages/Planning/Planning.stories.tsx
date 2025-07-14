import React from 'react'
import { Story, Meta } from '@storybook/react'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import { Planning, IPlanningProps } from 'pages/Planning/Planning'

export default {
  title: 'Pages/Planning',
  component: Planning,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
  args: {},
} as Meta

// const Template: Story<IPlanningProps> = (args) => {
//   return <Planning {...args} />
// }

/**
 * Pages need the MemoryRouter to simulate ConnectedRouter
 */
const Template: Story<IPlanningProps> = (args) => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Route
        component={(routerProps: RouteComponentProps) => {
          return <Planning {...args} {...routerProps} />
        }}
        path="/"
      />
    </MemoryRouter>
  )
}

export const Default = Template.bind({})
Default.args = {}
