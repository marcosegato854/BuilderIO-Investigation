import React from 'react'
import { Story, Meta } from '@storybook/react'
import { CameraPreview, ICameraPreviewProps } from './CameraPreview'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
// const defaultOptions: Array<IClickableOption> = [
//   {
//     value: 'edit',
//     label: 'Edit Project',
//   }
// ]
const defaultProps: ICameraPreviewProps = {
  leftCameraOrientation: 'landscape',
  rightCameraOrientation: 'landscape',
}

export default {
  title: 'Molecules/CameraPreview',
  component: CameraPreview,
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

const Template: Story<ICameraPreviewProps> = (args) => {
  return <CameraPreview {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
