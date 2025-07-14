import React from 'react'
import { Story, Meta } from '@storybook/react'
import { HelpButton, IHelpButtonProps } from './HelpButton'
import translations from '../../../../public/assets/i18n/en/translation.json'

const defaultProps: Partial<IHelpButtonProps> = {
  infoIcon: true,
  node: 'dmi_none',
  position: 'center',
}

export default {
  title: 'Atoms/HelpButton',
  component: HelpButton,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    node: {
      control: {
        type: 'select',
        options: Object.keys(translations.help),
      },
    },
    position: {
      control: {
        type: 'select',
        options: ['top', 'center'],
      },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IHelpButtonProps> = (args) => {
  return (
    <div style={{ padding: '200px 200px' }}>
      <HelpButton {...args} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = defaultProps
