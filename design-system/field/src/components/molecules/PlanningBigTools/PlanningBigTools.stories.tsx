import React from 'react'
import { Story, Meta } from '@storybook/react'
import { PlanningBigTools, IPlanningBigToolsProps } from './PlanningBigTools'
import { PlanningTools } from 'store/features/planning/types'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
// const defaultProps: IPlanningBigToolsProps = {
//   propertyA: 'hello',
//   propertyB: true,
// }
const defaultProps: Partial<IPlanningBigToolsProps> = {
  currentPolygonAvailable: false,
  isPolygon: false,
  selected: PlanningTools.DRAW_PATH,
}

export default {
  title: 'Molecules/PlanningBigTools',
  component: PlanningBigTools,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    // propertyA: {
    //   defaultValue: defaultProps.propertyA,
    // },
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

const Template: Story<IPlanningBigToolsProps> = (args) => {
  return <PlanningBigTools {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
