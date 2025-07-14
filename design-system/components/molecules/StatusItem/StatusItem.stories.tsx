import React from 'react'
import { Story, Meta } from '@storybook/react'
import { StatusItem, IStatusItemProps } from './StatusItem'

const defaultValues: IStatusItemProps = {
  accuracy: 0,
  label: 'Label',
  value: 'value',
  hidden: false,
}

export default {
  title: 'Molecules/StatusItem',
  component: StatusItem,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IStatusItemProps> = (args) => {
  return <StatusItem {...args} />
}

export const Default = Template.bind({})
Default.args = defaultValues
