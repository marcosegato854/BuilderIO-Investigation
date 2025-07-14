import React from 'react'
import { Story, Meta } from '@storybook/react'
import { PlanningTopLeftControls } from './PlanningTopLeftControls'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
// const defaultProps: IPlanningTopLeftControlsProps = {
//   propertyA: 'hello',
//   propertyB: true,
// }

export default {
  title: 'Molecules/PlanningTopLeftControls',
  component: PlanningTopLeftControls,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
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

const Template: Story = (args) => {
  return <PlanningTopLeftControls {...args} />
}

export const Default = Template.bind({})
Default.args = {}
