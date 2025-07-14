import React from 'react'
import { Story, Meta } from '@storybook/react'
import { CustomSlider, ICustomSliderProps } from './CustomSlider'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
const defaultProps: ICustomSliderProps = {
  unit: 'cm',
  value: 65,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  // onChangeCommitted: () => console.log('change committed'),
}

export default {
  title: 'Atoms/CustomSlider',
  component: CustomSlider,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    unit: {
      defaultValue: defaultProps.unit,
    },
    value: {
      defaultValue: defaultProps.value,
    },
    min: {
      defaultValue: defaultProps.min,
    },
    max: {
      defaultValue: defaultProps.max,
    },
    step: {
      defaultValue: defaultProps.step,
    },
    disabled: {
      defaultValue: defaultProps.disabled,
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ICustomSliderProps> = (args) => {
  return (
    <div style={{ width: '50%', margin: 'auto', padding: '40px' }}>
      <CustomSlider {...args} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = defaultProps
