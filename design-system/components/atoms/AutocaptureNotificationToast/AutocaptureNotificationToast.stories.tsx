import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  AutocaptureNotificationToast,
  IAutocaptureNotificationToastProps,
} from 'components/atoms/AutocaptureNotificationToast/AutocaptureNotificationToast'

const defaultProps: IAutocaptureNotificationToastProps = {
  notification: {
    id: 1,
    time: '2021-11-24T09:36:01',
    type: 0,
    code: 'STT-002',
    description: 'Automatic stop recording in {p1} seconds',
    p1: '5',
  },
  buttonLabel: 'Continue recording',
}

export default {
  title: 'Atoms/AutocaptureNotificationToast',
  component: AutocaptureNotificationToast,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    notification: {
      defaultValue: defaultProps.notification,
    },
    buttonLabel: {
      defaultValue: defaultProps.buttonLabel,
    },
  },
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IAutocaptureNotificationToastProps> = (args) => {
  return <AutocaptureNotificationToast {...args} />
}
export const Default = Template.bind({})
Default.args = defaultProps

const TemplateWithButton: Story<IAutocaptureNotificationToastProps> = (
  args
) => {
  return <AutocaptureNotificationToast {...args} onClick={() => {}} />
}
export const WithButton = TemplateWithButton.bind({})
WithButton.args = defaultProps
