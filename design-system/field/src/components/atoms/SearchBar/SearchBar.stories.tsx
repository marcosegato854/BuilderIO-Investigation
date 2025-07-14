import React from 'react'
import { Story, Meta } from '@storybook/react'
import { SearchBar, ISearchBarProps } from './SearchBar'

const defaultProps: Partial<ISearchBarProps> = {
  disabled: false,
  customPlaceholder: 'Type something here',
}
export default {
  title: 'Atoms/SearchBar',
  component: SearchBar,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ISearchBarProps> = (args) => {
  return <SearchBar {...args} />
}
export const Default = Template.bind({})
Default.args = defaultProps

const TemplateInitialValue: Story<ISearchBarProps> = (args) => {
  return <SearchBar {...args} initialValue="Milan" />
}
export const InitialValue = TemplateInitialValue.bind({})
InitialValue.args = defaultProps
