import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Switch, ISwitchProps } from './Switch'

const defaultProps: ISwitchProps = {
  disabled: false,
}

export default {
  title: 'Atoms/Switch',
  component: Switch,
  argTypes: {},
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ISwitchProps> = (args) => {
  return <Switch {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
