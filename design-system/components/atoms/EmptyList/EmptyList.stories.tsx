import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  EmptyList,
  IEmptyListProps,
} from 'components/atoms/EmptyList/EmptyList'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
const defaultProps: IEmptyListProps = {
  title: 'hello',
  subtitle: 'subtitle',
  isProject: true,
}

export default {
  title: 'Atoms/EmptyList',
  component: EmptyList,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    onClickNew: {
      table: {
        disable: true,
      },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IEmptyListProps> = (args) => {
  return <EmptyList {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
