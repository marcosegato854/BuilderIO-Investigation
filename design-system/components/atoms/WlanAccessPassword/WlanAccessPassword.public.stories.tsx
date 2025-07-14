import React from 'react'
import { Story, Meta } from '@storybook/react'
import { WlanAccessPassword, IWlanAccessPassword } from './WlanAccessPassword'

const defaultProps: Partial<IWlanAccessPassword> = {}

export default {
  title: 'Atoms/WlanAccessPassword',
  component: WlanAccessPassword,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IWlanAccessPassword> = (args) => {
  return <WlanAccessPassword {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
