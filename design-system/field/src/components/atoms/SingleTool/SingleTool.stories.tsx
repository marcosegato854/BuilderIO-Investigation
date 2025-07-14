import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Icon } from 'components/atoms/Icon/Icon'
import { SingleTool, ISingleToolProps } from './SingleTool'

const defaultProps: Partial<ISingleToolProps> = {
  icon: <Icon name="Compass" />,
  disabled: false,
  selected: false,

  tooltipMessage: 'Click here',
  transparent: false,
  // onClick: console.info,
}

export default {
  title: 'Atoms/SingleTool',
  component: SingleTool,
  argTypes: {
    icon: {
      options: ['Compass', 'ACPlug', 'BackArrow', 'Battery'],
      mapping: {
        Compass: <Icon name="Compass" />,
        ACPlug: <Icon name="ACPlug" />,
        BackArrow: <Icon name="BackArrow" />,
        Battery: <Icon name="Battery" />,
      },
    },
    onClick: {
      table: { disable: true },
    },
  },
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ISingleToolProps> = (args) => {
  return <SingleTool {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
