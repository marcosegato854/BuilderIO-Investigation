import React from 'react'
import { Story, Meta } from '@storybook/react'
import { OptionButton, IOptionButtonProps } from './OptionButton'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
// const defaultOptions: Array<IClickableOption> = [
//   {
//     value: 'edit',
//     label: 'Edit Project',
//   }
// ]

export default {
  title: 'Atoms/OptionButton',
  component: OptionButton,
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

//Default
const defaultProps: Partial<IOptionButtonProps> = {
  title: 'Click me',
  caption: '',
  showSwitch: false,
  captionHighlighted: false,
}

const Template: Story<IOptionButtonProps> = (args) => {
  return <OptionButton {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
