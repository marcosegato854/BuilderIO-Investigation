import React from 'react'
import { Story, Meta } from '@storybook/react'
import LanConnectionHelp, { ILanConnectionHelpProps } from './LanConnectionHelp'

const defaultProps: ILanConnectionHelpProps = {}

export default {
  title: 'Dialogs/LanConnectionHelp',
  component: LanConnectionHelp,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ILanConnectionHelpProps> = (args) => {
  return <LanConnectionHelp {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
