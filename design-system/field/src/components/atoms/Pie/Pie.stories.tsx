import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Pie, IPieProps } from 'components/atoms/Pie/Pie'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
const defaultProps: IPieProps = {
  perc: 80,
}

export default {
  title: 'Atoms/Pie',
  component: Pie,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    perc: {
      defaultValue: defaultProps.perc,
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IPieProps> = (args) => {
  return <Pie {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
