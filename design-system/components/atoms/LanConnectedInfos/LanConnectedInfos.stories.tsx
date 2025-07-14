import React from 'react'
import { Story, Meta } from '@storybook/react'
import { LanConnectedInfos, ILanConnectedInfos } from './LanConnectedInfos'

export default {
  title: 'Atoms/LanConnectedInfos',
  component: LanConnectedInfos,
} as Meta

const defaultProps: Partial<ILanConnectedInfos> = {
  usernameValue: '',
  passwordValue: 'Admin',
  IpValue: '',
}

const Template: Story<ILanConnectedInfos> = (args) => {
  return <LanConnectedInfos {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
