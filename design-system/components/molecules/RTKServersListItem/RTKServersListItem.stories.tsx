import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  RTKServersListItem,
  IRTKServersListItemProps,
} from './RTKServersListItem'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
const defaultProps: IRTKServersListItemProps = {
  server: {
    name: 'Test Server',
    password: 'mypassword',
    port: '8000',
    server: '127.0.0.1:8000',
    user: 'username',
    mountpoint: 'Mountpoint 2',
    interfacemode: 'MODE3',
    connected: true,
  },
  connected: false,
  onEdit: () => {},
  isEditing: false,
}

export default {
  title: 'Molecules/RTKServersListItem',
  component: RTKServersListItem,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    onEdit: {
      table: {
        disable: true,
      },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IRTKServersListItemProps> = (args) => {
  return <RTKServersListItem {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
