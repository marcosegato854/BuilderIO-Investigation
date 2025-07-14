import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  AntennaActions,
  IAntennaActionsProps,
} from 'components/molecules/AntennaActions/AntennaActions'

const defaultProps: Partial<IAntennaActionsProps> = {
  apiProgress: false,
  manual: false,
}

export default {
  title: 'Molecules/AntennaActions',
  component: AntennaActions,
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

const Template: Story<IAntennaActionsProps> = (args) => {
  return (
    <AntennaActions
      {...args}
      calculate={() => {}}
      setManual={() => {}}
      useSavedValues={() => {}}
    />
  )
}

export const Default = Template.bind({})
Default.args = defaultProps
