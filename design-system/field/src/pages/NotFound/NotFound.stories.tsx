import React from 'react'
import { Story, Meta } from '@storybook/react'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import { NotFound, INotFoundProps } from 'pages/NotFound/NotFound'

export default {
  title: 'Pages/NotFound',
  component: NotFound,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
  args: {},
} as Meta

// const Template: Story<INotFoundProps> = (args) => {
//   return <NotFound {...args} />
// }

/**
 * Pages need the MemoryRouter to simulate ConnectedRouter
 */
const Template: Story<INotFoundProps> = (args) => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Route
        component={(routerProps: RouteComponentProps) => {
          return <NotFound {...args} {...routerProps} />
        }}
        path="/"
      />
    </MemoryRouter>
  )
}

export const Default = Template.bind({})
Default.args = {}
