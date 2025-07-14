import React from 'react'
import { Story, Meta } from '@storybook/react'
import { ErrorItem, IErrorItemProps } from './ErrorItem'

export default {
  title: 'Atoms/ErrorItem',
  component: ErrorItem,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

//Default
const defaultProps: Partial<IErrorItemProps> = {
  title: 'Click me',
  datetime: 'time',
  type: 'Error',
}

const Template: Story<IErrorItemProps> = (args) => {
  return <ErrorItem {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
