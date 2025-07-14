import React from 'react'
import { Story, Meta } from '@storybook/react'
import { SupportForm, ISupportFormProps } from './SupportForm'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
// const defaultProps: ISupportFormProps = {
//   propertyA: 'hello',
//   propertyB: true,
// }
const emailList: IOption[] = [
  { label: 'leica.support@uk.com', value: 'leica.support@uk.com' },
  { label: 'leica.supporto@it.com', value: 'leica.supporto@it.com' },
  { label: 'leica.hilfe@de.com', value: 'leica.hilfe@de.com' },
]

const motivationList: IOption[] = [
  {
    label: 'Acquisition',
    value: 'acquisition',
  },
  {
    label: 'Device connection',
    value: 'deviceConnection',
  },
  {
    label: 'Other',
    value: 'other',
  },
]

export default {
  title: 'Molecules/SupportForm',
  component: SupportForm,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    emailList: {
      defaultValue: emailList,
    },
    motivationList: {
      defaultValue: motivationList,
    },
    // 2) Assign the default value to the related property inside of argTypes{}
    // propertyA: {
    //   defaultValue: defaultProps.propertyA,
    // },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ISupportFormProps> = (args) => {
  return <SupportForm {...args} />
}

export const Default = Template.bind({})
Default.args = {}
