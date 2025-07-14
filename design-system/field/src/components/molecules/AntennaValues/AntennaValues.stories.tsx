import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  AntennaValues,
  IAntennaValuesProps,
} from 'components/molecules/AntennaValues/AntennaValues'
import { mockStore } from 'store/mock/mockStoreTests'

const defaultValues: Partial<IAntennaValuesProps> = {
  distance: '2',
  leverArm: {
    x: 1,
    y: 1,
    z: 1,
  },
  manual: true,
}
export default {
  title: 'Molecules/AntennaValues',
  component: AntennaValues,
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

const Template: Story<IAntennaValuesProps> = (args) => {
  return (
    <AntennaValues
      distance="2"
      distanceFocusHandler={() => {}}
      leverArm={null}
      manual={false}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      manualLeverarmHandler={(c: any) => (e: any) => {}}
      setDistance={() => {}}
      userInteractionHandler={() => {}}
    />
  )
}

export const Default = Template.bind({})
Default.args = defaultValues
