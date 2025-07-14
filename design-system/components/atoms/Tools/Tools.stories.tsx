import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Icon } from 'components/atoms/Icon/Icon'
import { Tools, IToolsProps } from './Tools'

const defaultProps: Partial<IToolsProps> = {
  leftIcon: <Icon name="Letter3D" />,
  rightIcon: <Icon name="CurrentPosition" />,
  // onLeftClick: console.info,
  // onRightClick: console.info,
}

export default {
  title: 'Atoms/Tools',
  component: Tools,
  argTypes: {
    leftIcon: {
      options: ['Letter3D', 'CurrentPosition', 'BackArrow', 'Battery'],
      mapping: {
        Letter3D: <Icon name="Letter3D" />,
        CurrentPosition: <Icon name="CurrentPosition" />,
        BackArrow: <Icon name="BackArrow" />,
        Battery: <Icon name="Battery" />,
      },
    },
    rightIcon: {
      options: ['Letter3D', 'CurrentPosition', 'BackArrow', 'Battery'],
      mapping: {
        Letter3D: <Icon name="Letter3D" />,
        CurrentPosition: <Icon name="CurrentPosition" />,
        BackArrow: <Icon name="BackArrow" />,
        Battery: <Icon name="Battery" />,
      },
    },
  },
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IToolsProps> = (args) => {
  return <Tools {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
