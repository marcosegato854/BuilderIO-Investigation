import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  RedPlusMobileButton,
  IRedPlusMobileButtonProps,
} from './RedPlusMobileButton'

export default {
  title: 'Atoms/RedPlusMobileButton',
  component: RedPlusMobileButton,
  argTypes: {},
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IRedPlusMobileButtonProps> = (args) => {
  return <RedPlusMobileButton {...args} />
}

export const Default = Template.bind({})
Default.args = {
  disabled: false,
}
