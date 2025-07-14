import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  DataAcquisitionRightControls,
  IDataAcquisitionRightControlsProps,
} from './DataAcquisitionRightControls'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
// const defaultOptions: Array<IClickableOption> = [
//   {
//     value: 'edit',
//     label: 'Edit Project',
//   }
// ]

export default {
  title: 'Organisms/DataAcquisitionRightControls',
  component: DataAcquisitionRightControls,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
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

const Template: Story<IDataAcquisitionRightControlsProps> = (args) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh', // otherwise it will occupy only the needed space and the button won't be placed in the center
      }}
    >
      <DataAcquisitionRightControls {...args} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {}
