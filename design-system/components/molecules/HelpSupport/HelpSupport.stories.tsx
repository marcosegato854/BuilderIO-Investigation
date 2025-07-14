import React from 'react'
import { Story, Meta } from '@storybook/react'
import { HelpSupport, IHelpSupportProps } from './HelpSupport'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
// const defaultOptions: Array<IClickableOption> = [
//   {
//     value: 'edit',
//     label: 'Edit Project',
//   }
// ]

export default {
  title: 'Molecules/HelpSupport',
  component: HelpSupport,
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

const Template: Story<IHelpSupportProps> = (args) => {
  return <HelpSupport {...args} />
}

export const Default = Template.bind({})
Default.args = {}
