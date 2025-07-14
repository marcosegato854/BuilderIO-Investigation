import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  DataAcquisitionLeftControls,
  IDataAcquisitionLeftControlsProps,
} from './DataAcquisitionLeftControls'
import { ViewMode } from 'store/features/position/types'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
// const defaultOptions: Array<IClickableOption> = [
//   {
//     value: 'edit',
//     label: 'Edit Project',
//   }
// ]
const defaultOptions: IDataAcquisitionLeftControlsProps = {
  viewMode: ViewMode.CAMERA,
}

export default {
  title: 'Molecules/DataAcquisitionLeftControls',
  component: DataAcquisitionLeftControls,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    viewMode: {
      defaultValue: defaultOptions.viewMode,
      control: {
        type: 'radio',
        options: [ViewMode.CAMERA, ViewMode.MAP, undefined],
      },
    },
    // 2) Assign the default value to the related property inside of argTypes{}
    // options: {
    //   defaultValue: defaultOptions,
    // },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IDataAcquisitionLeftControlsProps> = (args) => {
  return <DataAcquisitionLeftControls {...args} />
}

export const Default = Template.bind({})
Default.args = defaultOptions
