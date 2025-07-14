import React from 'react'
import { Story, Meta } from '@storybook/react'
import { MapSearchBar, IMapSearchBarProps } from './MapSearchBar'

const defaultProps: IMapSearchBarProps = {
  disabled: false,
}

export default {
  title: 'Molecules/MapSearchBar',
  component: MapSearchBar,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  // argTypes: {
  //   options: {
  //     defaultValue: defaultOptions,
  //   },
  // },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IMapSearchBarProps> = (args) => {
  return <MapSearchBar {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
