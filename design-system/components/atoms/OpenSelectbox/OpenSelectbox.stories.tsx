import React from 'react'
import { Story, Meta } from '@storybook/react'
import { OpenSelectbox, IOpenSelectboxProps } from './OpenSelectbox'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it

enum TestOptionValue {
  Value1 = 'value1',
  Value2 = 'value2',
  Value3 = 'value3',
}

const value: string = TestOptionValue.Value2
const defaultOptions: IOption[] = [
  {
    value: TestOptionValue.Value1,
    label: 'Value 1',
  },
  {
    value: TestOptionValue.Value2,
    label: 'Value 2',
  },
  {
    value: TestOptionValue.Value3,
    label: 'Value 3',
  },
]
const onChange = (newValue: string) => {
  console.info(newValue)
}

const defaultProps: IOpenSelectboxProps = {
  options: defaultOptions,
  disabled: false,
  value: 'value1',
}

export default {
  title: 'Atoms/OpenSelectbox',
  component: OpenSelectbox,
  argTypes: {
    value: {
      control: {
        type: 'select',
        options: { ...TestOptionValue, Wrong: 'wrong' },
      },
    },
  },
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IOpenSelectboxProps> = (args) => {
  return <OpenSelectbox {...args} />
}
export const Default = Template.bind({})
Default.args = defaultProps
