import React from 'react'
import { Story, Meta } from '@storybook/react'
import { CloseButton, ICloseButtonProps } from './CloseButton'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
// const defaultOptions: Array<IClickableOption> = [
//   {
//     value: 'edit',
//     label: 'Edit Project',
//   }
// ]

export default {
  title: 'Atoms/CloseButton',
  component: CloseButton,
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

const Template: Story<ICloseButtonProps> = (args) => {
  return <CloseButton {...args} />
}

export const Default = Template.bind({})
Default.args = {}
