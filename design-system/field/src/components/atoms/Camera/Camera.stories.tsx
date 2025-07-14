import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Camera, ICameraProps } from './Camera'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
const defaultProps: ICameraProps = {
  socketEndpoint: '/camera/sphere',
}

export default {
  title: 'Atoms/Camera',
  component: Camera,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    socketEndpoint: {
      defaultValue: defaultProps.socketEndpoint,
      // null / undefined / empty strings are handled by the component
      // defaultValue: null,
      // defaultValue: undefined,
      // defaultValue: '',
      control: {
        type: 'select',
        options: [
          '/camera/sphere',
          '/camera/left%20backward',
          '/camera/left%20rear',
        ],
      },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ICameraProps> = (args) => {
  return (
    <div style={{ width: 500, height: 500 }}>
      <Camera {...args} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {}
