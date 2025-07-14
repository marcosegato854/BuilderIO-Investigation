import React from 'react'
import { Story, Meta } from '@storybook/react'
import { VideoPlayer, IVideoPlayerProps } from './VideoPlayer'

const defaultProps: IVideoPlayerProps = {
  url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
}

export default {
  title: 'Molecules/VideoPlayer',
  component: VideoPlayer,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IVideoPlayerProps> = (args) => {
  return <VideoPlayer {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
