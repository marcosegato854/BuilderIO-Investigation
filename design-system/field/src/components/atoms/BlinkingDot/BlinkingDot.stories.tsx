import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Icon } from 'components/atoms/Icon/Icon'
import { BlinkingDot, IBlinkingDotProps } from './BlinkingDot'

const defaultProps: IBlinkingDotProps = {
  blinking: true,
}

export default {
  title: 'Atoms/BlinkingDot',
  component: BlinkingDot,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IBlinkingDotProps> = (args) => {
  return <BlinkingDot {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
