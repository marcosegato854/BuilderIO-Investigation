import React from 'react'
import { Story, Meta } from '@storybook/react'
import { mockStore } from 'store/mock/mockStoreTests'
import { GridFilters, IGridFiltersProps } from './GridFilters'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
// const defaultOptions: Array<IClickableOption> = [
//   {
//     value: 'edit',
//     label: 'Edit Project',
//   }
// ]
const defaultValue: Partial<IGridFiltersProps> = {
  title: '',
}

export default {
  title: 'Molecules/GridFilters',
  component: GridFilters,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    // options: {
    //   defaultValue: defaultOptions,
    // },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IGridFiltersProps> = (args) => {
  return (
    <GridFilters
      {...args}
      gridSettings={mockStore.dataStorageService.jobGridSettings}
    />
  )
}

export const Default = Template.bind({})
Default.args = defaultValue
