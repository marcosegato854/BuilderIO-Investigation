import React from 'react'
import { Story, Meta } from '@storybook/react'
import { ActiveLan, IActiveLan } from './ActiveLan'

const defaultProps: Partial<IActiveLan> = {
  IP: '192.168.3.5',
  LanConnected: false,
  password: 'trkuser',
  userName: 'TRKUser',
}

export default {
  title: 'Molecules/ActiveLan',
  component: ActiveLan,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IActiveLan> = (args) => {
  return <ActiveLan {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
