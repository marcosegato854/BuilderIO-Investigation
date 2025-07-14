import React from 'react'
import { Story, Meta } from '@storybook/react'
import { ActiveNetwork, IActiveNetwork } from './ActiveNetwork'

const defaultProps: Partial<IActiveNetwork> = {
  IP: '192.168.3.5',
  networkName: 'your-hotspot',
  password: 'trkuser',
  userName: 'TRKUser',
  qrLink:
    'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
  onDisconnect: undefined,
}

export default {
  title: 'Molecules/ActiveNetwork',
  component: ActiveNetwork,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IActiveNetwork> = (args) => {
  return <ActiveNetwork {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
