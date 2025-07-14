import React from 'react'
import { Story, Meta } from '@storybook/react'
import { WlanLogin, IWlanLogin } from './WlanLogin'

const defaultProps: Partial<IWlanLogin> = {}

export default {
  title: 'Molecules/WlanLogin',
  component: WlanLogin,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IWlanLogin> = (args) => {
  return <WlanLogin {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
