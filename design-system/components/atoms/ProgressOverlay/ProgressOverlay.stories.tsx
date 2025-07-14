import React from 'react'
import { Story, Meta } from '@storybook/react'
import { ProgressOverlay, IProgressOverlayProps } from './ProgressOverlay'

const defaultProps: IProgressOverlayProps = {
  display: true,
  message: 'some text here',
  progress: 30,
}

export default {
  title: 'Atoms/ProgressOverlay',
  component: ProgressOverlay,
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IProgressOverlayProps> = (args) => {
  return <ProgressOverlay {...args} />
}
export const Default = Template.bind({})
Default.args = defaultProps

const TemplateMessageOnly: Story<IProgressOverlayProps> = (args) => {
  return <ProgressOverlay {...args} progress={0} />
}
export const MessageOnly = TemplateMessageOnly.bind({})
MessageOnly.args = defaultProps
