import React from 'react'
import { Story, Meta } from '@storybook/react'
import { CameraBox, ICameraBoxProps } from './CameraBox'

// Example of how we should declare attributes' default values:

const endpoints: string[] = [
  '/camera/sphere',
  '/camera/left%20backward',
  '/camera/left%20rear',
  '/camera/sphere',
  '/camera/left%20backward',
  '/camera/left%20rear',
]

// 1) Declare the default value with the right type and initilize it
const defaultProps: ICameraBoxProps = {
  socketEndpoints: endpoints,
}

export default {
  title: 'Molecules/CameraBox',
  component: CameraBox,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    socketEndpoints: {
      defaultValue: defaultProps.socketEndpoints,
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ICameraBoxProps> = (args) => {
  return <CameraBox {...args} />
}

export const Default = Template.bind({})
Default.args = {}
