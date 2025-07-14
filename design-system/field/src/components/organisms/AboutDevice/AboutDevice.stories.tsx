import React from 'react'
import { Story, Meta } from '@storybook/react'
import { AboutDevice } from './AboutDevice'

export default {
  title: 'Organisms/AboutDevice',
  component: AboutDevice,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story = (args) => {
  return <AboutDevice {...args} />
}

export const Default = Template.bind({})
Default.args = {}
