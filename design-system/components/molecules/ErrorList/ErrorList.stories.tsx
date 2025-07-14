import React from 'react'
import { Story, Meta } from '@storybook/react'
import { ErrorList } from './ErrorList'

export default {
  title: 'Molecules/ErrorList',
  component: ErrorList,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story = (args) => {
  return <ErrorList {...args} />
}

export const Default = Template.bind({})
// Default.args = defaultProps
