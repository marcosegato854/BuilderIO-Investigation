import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  NeededBlock,
  INeededBlockProps,
} from 'components/atoms/NeededBlock/NeededBlock'
import { mockStore } from 'store/mock/mockStoreTests'

const defaultProps: INeededBlockProps = {
  needed: mockStore.planningService.needed!,
  variant: 'default',
}

export default {
  title: 'Atoms/NeededBlock',
  component: NeededBlock,
  argTypes: {
    variant: {
      control: {
        type: 'select',
        options: ['bigger', 'default'],
      },
    },
  },
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<INeededBlockProps> = (args) => {
  return <NeededBlock {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
