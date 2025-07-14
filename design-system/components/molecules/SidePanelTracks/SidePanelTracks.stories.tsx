import React from 'react'
import { Story, Meta } from '@storybook/react'
import { SidePanelTracks, ISidePanelTracksProps } from './SidePanelTracks'

export default {
  title: 'Molecules/SidePanelTracks',
  component: SidePanelTracks,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ISidePanelTracksProps> = (args) => {
  return <SidePanelTracks {...args} />
}

export const Default = Template.bind({})
Default.args = {}
