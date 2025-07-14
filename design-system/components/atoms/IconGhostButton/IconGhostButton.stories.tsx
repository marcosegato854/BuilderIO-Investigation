import React from 'react'
import { Story, Meta } from '@storybook/react'
import { IconGhostButton, IIconGhostButtonProps } from './IconGhostButton'

export default {
  title: 'Atoms/IconGhostButton',
  component: IconGhostButton,
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
const defaultProps: Partial<IIconGhostButtonProps> = {
  icon: 'DrawTrack',
  onClick: undefined,
}

const Template: Story<IIconGhostButtonProps> = (args) => {
  return <IconGhostButton {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
