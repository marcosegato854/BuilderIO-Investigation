import React from 'react'
import { Story, Meta } from '@storybook/react'
import Alert, { IAlertProps } from './Alert'

// Example of how we should declare attributes' default values:

const defaultProps: IAlertProps = {
  type: 'error',
  text: 'Do you really want to delete this project? Al the content of this project will be removed.',
  title: 'Delete Project1',
}

export default {
  title: 'Dialogs/Alert',
  component: Alert,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    type: {
      defaultValue: defaultProps.type,
      control: {
        type: 'select',
        options: ['warning', 'error', 'message'],
      },
    },
    variant: {
      defaultValue: defaultProps.type,
      control: {
        type: 'select',
        options: ['colored', 'gray'],
      },
    },
    cancelButtonLabel: {
      table: { disable: true },
    },
    okButtonCallback: {
      table: { disable: true },
    },
    checkboxCallback: {
      table: { disable: true },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IAlertProps> = (args) => {
  return <Alert {...args} />
}

export const ConfirmDialog = Template.bind({})
ConfirmDialog.args = {
  ...defaultProps,
  cancelButtonLabel: 'Cancel',
  okButtonCallback: console.info,
  okButtonLabel: 'YES, DELETE',
}

export const EstimationDialog = Template.bind({})
EstimationDialog.args = {
  type: 'message',
  noWrapButton: true,
  okButtonLabel: 'Move the Job to a new disk',
  cancelButtonLabel: 'Continue Anyway',
}

export const AlertDialog = Template.bind({})
AlertDialog.args = {
  ...defaultProps,
  title: 'Job2',
  text: 'You cannot start the same job again but you can perform further actions, processing, view & mesure etc..',
  okButtonLabel: 'I understand',
  okButtonCallback: console.info,
}

export const BlurAlertDialog = Template.bind({})
BlurAlertDialog.args = {
  ...defaultProps,
  title: 'Non-compliance of <a href="" target="_blank">GDPR</a>',
  variant: 'colored',
  type: 'warning',
  text: 'Some message about GDPR',
  checkboxLabel: 'Do not show this warning for 30days',
  checkboxCallback: console.info,
}
