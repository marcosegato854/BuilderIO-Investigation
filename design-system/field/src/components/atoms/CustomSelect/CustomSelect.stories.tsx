import React from 'react'
import { Story, Meta } from '@storybook/react'
import { CustomSelect } from './CustomSelect'
import { MenuItem, SelectProps } from '@mui/material'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
const defaultProps: SelectProps = {
  value: 1,
  label: 'Sketch',
  // onChangeCommitted: () => console.log('change committed'),
}

export default {
  title: 'Atoms/CustomSelect',
  component: CustomSelect,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    value: {
      defaultValue: defaultProps.value,
    },
    label: {
      defaultValue: defaultProps.label,
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<SelectProps> = (args) => {
  return (
    <CustomSelect {...args}>
      <MenuItem value={0}>Principle</MenuItem>
      <MenuItem value={1}>Sketch</MenuItem>
      <MenuItem value={2}>Photoshop</MenuItem>
      <MenuItem value={3}>Framer</MenuItem>
    </CustomSelect>
  )
}

export const Default = Template.bind({})
Default.args = defaultProps
