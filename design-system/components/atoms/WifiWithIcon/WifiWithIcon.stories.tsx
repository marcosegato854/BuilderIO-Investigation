import React from 'react'
import { Story, Meta } from '@storybook/react'
import { WifiWithIcon, IWifiWithIcon } from './WifiWithIcon'

const defaultProps: Partial<IWifiWithIcon> = {
  Text: 'Wifi name',
}

export default {
  title: 'Atoms/WifiWithIcon',
  component: WifiWithIcon,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IWifiWithIcon> = (args) => {
  return <WifiWithIcon {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
