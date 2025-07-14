import React from 'react'
import { Story, Meta } from '@storybook/react'
import SaveAsCustomJobType, {
  ISaveAsCustomJobTypeProps,
} from 'components/dialogs/SaveAsCustomJobType/SaveAsCustomJobType'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
// const defaultProps: ISaveAsCustomJobTypeProps = {
//   propertyA: 'hello',
//   propertyB: true,
// }

export default {
  title: 'Dialogs/SaveAsCustomJobType',
  component: SaveAsCustomJobType,
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

const Template: Story<ISaveAsCustomJobTypeProps> = (args) => {
  return (
    <SaveAsCustomJobType
      okButtonCallback={() => {
        console.info('ok')
      }}
      cancelButtonCallback={() => {
        console.info('cancel')
      }}
    />
  )
}

export const Default = Template.bind({})
Default.args = {}
