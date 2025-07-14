import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  Copyright,
  ICopyrightProps,
} from 'components/molecules/Copyright/Copyright'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
const defaultProps: ICopyrightProps = {
  pcuVersion: false,
}

export default {
  title: 'Molecules/Copyright',
  component: Copyright,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    // propertyA: {
    //   defaultValue: defaultProps.propertyA,
    // },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ICopyrightProps> = (args) => {
  return <Copyright {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
