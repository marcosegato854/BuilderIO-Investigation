import React from 'react'
import { Story, Meta } from '@storybook/react'
import { LoadingScreen, ILoadingScreenProps } from './LoadingScreen'

export default {
  title: 'Organisms/LoadingScreen',
  component: LoadingScreen,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ILoadingScreenProps> = (args) => {
  return <LoadingScreen {...args} />
}

export const Default = Template.bind({})
Default.args = {}
