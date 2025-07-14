import React from 'react'
import { Story, Meta } from '@storybook/react'
import { PasswordLabel, IPasswordLabel } from './PasswordLabel'

export default {
  title: 'Atoms/PasswordLabel',
  component: PasswordLabel,
} as Meta

const defaultProps: Partial<IPasswordLabel> = {
  inputValue: 'Admin',
}

const Template: Story<IPasswordLabel> = (args) => {
  return <PasswordLabel {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
