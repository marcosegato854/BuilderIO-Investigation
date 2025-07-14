import React from 'react'
import { Story, Meta } from '@storybook/react'
import { LoginForm, ILoginFormProps } from './LoginForm'

const defaultProps: ILoginFormProps = {
  currentForm: 'login',
}

export default {
  title: 'Molecules/LoginForm',
  component: LoginForm,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    /* there are 2 available forms: login form and the 'forgot' one */
    currentForm: {
      control: { type: 'radio' },
      options: ['login', 'forgot'],
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ILoginFormProps> = (args) => {
  return <LoginForm {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
