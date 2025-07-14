import React from 'react'
import { Story, Meta } from '@storybook/react'
import UsersConnectedSvg from './UsersConnectedSvg'

export default {
  title: 'Atoms/UsersConnectedSvg',
  component: UsersConnectedSvg,
} as Meta
const Template: Story<null> = () => {
  return <UsersConnectedSvg />
}

export const Default = Template.bind({})

