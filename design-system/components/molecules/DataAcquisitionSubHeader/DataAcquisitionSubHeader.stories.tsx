import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  DataAcquisitionSubHeader,
  IDataAcquisitionSubHeaderProps,
} from './DataAcquisitionSubHeader'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
// const defaultOptions: Array<IClickableOption> = [
//   {
//     value: 'edit',
//     label: 'Edit Project',
//   }
// ]
const defaultProps: IDataAcquisitionSubHeaderProps = {
  mode: 'map',
}

export default {
  title: 'Molecules/DataAcquisitionSubHeader',
  component: DataAcquisitionSubHeader,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    // options: {
    //   defaultValue: defaultOptions,
    // },
    mode: {
      defaultValue: defaultProps.mode,
      control: {
        type: 'radio',
        options: ['map', 'camera'],
      },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IDataAcquisitionSubHeaderProps> = (args) => {
  return <DataAcquisitionSubHeader {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
