import React from 'react'
import { Meta, Story } from '@storybook/react'
import CoordinateSystemSelector from './CoordinateSystemSelector'

export default {
  title: 'Molecules/CoordinateSystemSelector',
  component: CoordinateSystemSelector,
} as Meta

const Template: Story = (args) => (
  <CoordinateSystemSelector {...args} label="test" />
)

export const Default = Template.bind({})
Default.args = {
  // Add default props here
}

export const WithCustomProps = Template.bind({})
WithCustomProps.args = {
  // Add custom props here
}
