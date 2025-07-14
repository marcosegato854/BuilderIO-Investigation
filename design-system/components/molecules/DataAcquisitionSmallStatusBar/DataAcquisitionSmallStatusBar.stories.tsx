import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  DataAcquisitionSmallStatusBar,
  IDataAcquisitionSmallStatusBarProps,
} from './DataAcquisitionSmallStatusBar'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
const defaultProps: IDataAcquisitionSmallStatusBarProps = {
  rtkEnabled: false,
}

export default {
  title: 'Molecules/DataAcquisitionSmallStatusBar',
  component: DataAcquisitionSmallStatusBar,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    /* rtkEnabled: {
      defaultValue: defaultProps.rtkEnabled,
    }, */
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IDataAcquisitionSmallStatusBarProps> = (args) => {
  return <DataAcquisitionSmallStatusBar {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
