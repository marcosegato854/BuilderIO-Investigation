import React from 'react'
import { Story, Meta } from '@storybook/react'
import { DiskSelectBox, IDiskSelectBoxProps } from './DiskSelectBox'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
// const defaultProps: IDiskSelectBoxProps = {
//   propertyA: 'hello',
//   propertyB: true,
// }
enum TestOptionValue {
  Value1 = 'disk1',
  Value2 = 'disk2',
  Value3 = 'disk3',
}

const value: string = TestOptionValue.Value2
const defaultOptions: IOptionDisk[] = [
  {
    value: TestOptionValue.Value1,
    label: 'Disk 1',
    critical: true,
  },
  {
    value: TestOptionValue.Value2,
    label: 'Disk 2',
    critical: false,
  },
  {
    value: TestOptionValue.Value3,
    label: 'Disk 3',
    critical: true,
  },
]

export default {
  title: 'Atoms/DiskSelectBox',
  component: DiskSelectBox,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IDiskSelectBoxProps> = (args) => {
  return <DiskSelectBox {...args} />
}

export const Default = Template.bind({})
Default.args = {
  disabled: false,
  options: defaultOptions,
  value: TestOptionValue.Value1,
}
