import React from 'react'
import { Story, Meta } from '@storybook/react'
import { FilterBox, IFilterBoxProps } from './FilterBox'

export default {
  title: 'Atoms/FilterBox',
  component: FilterBox,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // options: {
    //   table: {
    //     disable: true,
    //   },
    // },
    initialSelectedIndex: {
      table: {
        disable: true,
      },
    },
    onChange: {
      table: {
        disable: true,
      },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IFilterBoxProps> = (args) => {
  return <FilterBox {...args} />
}

export const Default = Template.bind({})
Default.args = {
  disabled: false,
  title: 'Choose country',
  options: [
    { label: 'Australia' },
    { label: 'Brazil' },
    { label: 'China' },
    { label: 'Denmark' },
    { label: 'Egypt' },
  ],
  initialSelectedIndex: 0,
}
