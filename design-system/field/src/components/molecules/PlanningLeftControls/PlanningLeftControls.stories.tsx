import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  PlanningLeftControls,
  IPlanningLeftControlsProps,
} from './PlanningLeftControls'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
// const defaultOptions: Array<IClickableOption> = [
//   {
//     value: 'edit',
//     label: 'Edit Project',
//   }
// ]

export default {
  title: 'Molecules/PlanningLeftControls',
  component: PlanningLeftControls,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    // options: {
    //   defaultValue: defaultOptions,
    // },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IPlanningLeftControlsProps> = (args) => {
  return <PlanningLeftControls {...args} />
}

export const Default = Template.bind({})
Default.args = {}
