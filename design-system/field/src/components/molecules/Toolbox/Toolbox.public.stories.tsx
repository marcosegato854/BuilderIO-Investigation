import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Toolbox, IToolboxProps } from './Toolbox'
import { PlanningTools } from 'store/features/planning/types'

const defaultProps: Partial<IToolboxProps> = {
  selected: undefined,
}

export default {
  title: 'Molecules/Toolbox',
  component: Toolbox,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    selected: {
      control: {
        type: 'select',
        options: Object.values(PlanningTools),
      },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IToolboxProps> = (args) => {
  return <Toolbox {...args} />
}

export const Default = Template.bind({})
Default.args = {}
