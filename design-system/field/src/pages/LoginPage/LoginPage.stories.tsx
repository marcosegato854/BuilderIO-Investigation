import React from 'react'
import { Story, Meta } from '@storybook/react'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import { LoginPage, ILoginPageProps } from 'pages/LoginPage/LoginPage'

export default {
  title: 'Pages/LoginPage',
  component: LoginPage,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
  args: {},
} as Meta

// const Template: Story<ILoginPageProps> = (args) => {
//   return <LoginPage {...args} />
// }

/**
 * Pages need the MemoryRouter to simulate ConnectedRouter
 */
const Template: Story<ILoginPageProps> = (args) => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Route
        component={(routerProps: RouteComponentProps) => {
          return <LoginPage {...args} {...routerProps} />
        }}
        path="/"
      />
    </MemoryRouter>
  )
}

export const Default = Template.bind({})
Default.args = {}
