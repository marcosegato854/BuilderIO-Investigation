import React from 'react'
import { Story, Meta } from '@storybook/react'
import { WlanNetwork, IWlanNetwork } from './WlanNetwork'

const defaultProps: Partial<IWlanNetwork> = {
  WLANsAvailable: 3,
  WifiText: 'WifiName',
  onClick: undefined,
}

export default {
  title: 'Molecules/WlanNetwork',
  component: WlanNetwork,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IWlanNetwork> = (args) => {
  return <WlanNetwork {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
