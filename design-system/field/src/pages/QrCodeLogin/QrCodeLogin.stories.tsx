import React from 'react'
import { Story, Meta } from '@storybook/react'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import { QrCodeLogin, IQrCodeLoginProps } from 'pages/QrCodeLogin/QrCodeLogin'

export default {
  title: 'Pages/QrCodeLogin',
  component: QrCodeLogin,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
  args: {},
} as Meta

// const Template: Story<IQrCodeLoginProps> = (args) => {
//   return <QrCodeLogin {...args} />
// }

/**
 * Pages need the MemoryRouter to simulate ConnectedRouter
 */
const Template: Story<IQrCodeLoginProps> = (args) => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Route
        component={(routerProps: RouteComponentProps) => {
          return <QrCodeLogin {...args} {...routerProps} />
        }}
        path="/"
      />
    </MemoryRouter>
  )
}

export const Default = Template.bind({})
Default.args = {}
