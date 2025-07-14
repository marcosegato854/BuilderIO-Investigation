import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  EditableRectangle,
  IEditableRectangleProps,
} from 'components/atoms/EditableRectangle/EditableRectangle'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
// const defaultProps: IEditableRectangleProps = {
//   propertyA: 'hello',
//   propertyB: true,
// }

export default {
  title: 'Atoms/EditableRectangle',
  component: EditableRectangle,
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

const Template: Story<IEditableRectangleProps> = (args) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        left: '0',
        top: '0',
      }}
    >
      <EditableRectangle {...args} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {}
