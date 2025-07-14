import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Zooming, IZoomingProps } from './Zooming'

export default {
  title: 'Atoms/Zooming',
  component: Zooming,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IZoomingProps> = (args) => {
  return <Zooming {...args} />
}

export const Default = Template.bind({})
Default.args = {}
