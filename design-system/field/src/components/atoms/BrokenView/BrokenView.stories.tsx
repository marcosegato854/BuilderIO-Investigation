import React from 'react'
import { Story, Meta } from '@storybook/react'
import { BrokenView, IBrokenViewProps } from './BrokenView'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
const defaultProps: IBrokenViewProps = {
  message: 'Test message',
  action: {
    onClick: () => {},
    label: 'Test label',
  },
}

export default {
  title: 'Atoms/BrokenView',
  component: BrokenView,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    action: {
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

const Template: Story<IBrokenViewProps> = (args) => {
  return <BrokenView {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
