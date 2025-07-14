import React from 'react'
import { Story, Meta } from '@storybook/react'
import { CameraView, ICameraViewProps } from './CameraView'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
// const defaultOptions: Array<IClickableOption> = [
//   {
//     value: 'edit',
//     label: 'Edit Project',
//   }
// ]
const defaultProps: ICameraViewProps = {
  leftCameraOrientation: 'landscape',
  rightCameraOrientation: 'landscape',
}

export default {
  title: 'Molecules/CameraView',
  component: CameraView,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    // options: {
    //   defaultValue: defaultOptions,
    // },
    leftCameraOrientation: {
      control: {
        type: 'radio',
        options: ['landscape', 'portrait'],
      },
    },
    rightCameraOrientation: {
      control: {
        type: 'radio',
        options: ['landscape', 'portrait'],
      },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ICameraViewProps> = (args) => {
  return <CameraView {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
