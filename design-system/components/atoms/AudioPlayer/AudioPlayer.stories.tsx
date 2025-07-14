import React from 'react'
import { Story, Meta } from '@storybook/react'
import { AudioPlayer, IAudioPlayerProps } from './AudioPlayer'
import { darkTheme } from 'utils/themes/mui'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
const defaultProps: IAudioPlayerProps = {
  src: 'https://file-examples.com/storage/fef1706276640fa2f99a5a4/2017/11/file_example_MP3_700KB.mp3',
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '10px',
  backgroundColor: darkTheme.colors.primary_8,
  height: '150px',
  width: '500px',
}

export default {
  title: 'Atoms/AudioPlayer',
  component: AudioPlayer,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    src: {
      defaultValue: defaultProps.src,
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IAudioPlayerProps> = (args) => {
  return (
    <div style={containerStyle}>
      <AudioPlayer {...args} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = defaultProps
