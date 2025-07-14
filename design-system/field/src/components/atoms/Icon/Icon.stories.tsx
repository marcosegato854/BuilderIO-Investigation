import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Icon, IIconProps } from 'components/atoms/Icon/Icon'
import style from 'components/atoms/Icon/Icon.module.scss'
import icons from 'components/atoms/Icon/icons'

const defaultProps: IIconProps = {
  name: 'ACPlug',
}

export default {
  title: 'Atoms/Icon',
  component: Icon,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    name: {
      control: {
        type: 'select',
        options: Object.keys(icons),
      },
    },
  },
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IIconProps> = (args) => {
  return <Icon {...args} ref={null} className={style.storybook} />
}

export const Default = Template.bind({})
Default.args = defaultProps
