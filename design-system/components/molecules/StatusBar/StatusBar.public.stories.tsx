import React from 'react'
import { Story, Meta } from '@storybook/react'
import { StatusBar, IStatusBar } from './StatusBar'

const defaultProps: Partial<IStatusBar> = { rtk: true }

export default {
  title: 'Molecules/StatusBar',
  component: StatusBar,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IStatusBar> = (args) => {
  return <StatusBar {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
