import React from 'react'
import { Story, Meta } from '@storybook/react'
import PolygonPlanFilter, { IPolygonPlanFilterProps } from './PolygonPlanFilter'
import { mockStore } from 'store/mock/mockStoreTests'

const defaultProps: IPolygonPlanFilterProps = {
  polygon: mockStore.planningService.undoablePolygons.present[0],
}

export default {
  title: 'Dialogs/PolygonPlanFilter',
  component: PolygonPlanFilter,
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

const Template: Story<IPolygonPlanFilterProps> = (args) => {
  return <PolygonPlanFilter {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
