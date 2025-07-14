import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Icon } from 'components/atoms/Icon/Icon'
import { BigTool, IBigToolProps } from './BigTool'

const defaultProps: IBigToolProps = {
  icon: <Icon name="DrawPolygon" />,
  description: 'Draw Polygon',
  onClick: console.info,
}

export default {
  title: 'Atoms/BigTool',
  component: BigTool,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    icon: {
      table: {
        disable: true,
      },
    },
    onClick: {
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

const Template: Story<IBigToolProps> = (args) => {
  return <BigTool {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
