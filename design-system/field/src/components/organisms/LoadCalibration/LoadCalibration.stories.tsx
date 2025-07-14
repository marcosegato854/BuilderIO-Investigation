import React from 'react'
import { Story, Meta } from '@storybook/react'
import { LoadCalibration } from './LoadCalibration'

export default {
  title: 'Organisms/LoadCalibration',
  component: LoadCalibration,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story = (args) => {
  return <LoadCalibration {...args} />
}

export const Default = Template.bind({})
Default.args = {}
