import React from 'react'
import { Story, Meta } from '@storybook/react'
import { SystemNotificationType } from 'store/features/system/types'
import AcquisitionDialog, { IAcquisitionDialogProps } from './AcquisitionDialog'

const defaultProps: IAcquisitionDialogProps = {
  type: SystemNotificationType.ERROR,
  okButtonLabel: 'Ok',
  text: 'Pleas go a little slower.',
}

export default {
  title: 'Dialogs/AcquisitionDialog',
  component: AcquisitionDialog,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    type: {
      defaultValue: defaultProps.type,
      control: {
        type: 'select',
        options: [2, 1, 4],
      },
    },
    okButtonLabel: {
      defaultValue: defaultProps.okButtonLabel,
    },
    text: {
      defaultValue: defaultProps.text,
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IAcquisitionDialogProps> = (args) => {
  return <AcquisitionDialog {...args} />
}

export const Default = Template.bind({})
Default.args = {}

// export const AlertDialog = Template.bind({})
// AlertDialog.args = {
//   title: 'Job2',
//   text:
//     'You cannot start the same job again but you can perform further actions, processing, view & mesure etc..',
//   okButtonCallback: undefined,
//   okButtonLabel: 'I understand',
// }
