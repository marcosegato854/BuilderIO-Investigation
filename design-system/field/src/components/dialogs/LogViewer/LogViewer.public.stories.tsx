import React from 'react'
import { Story, Meta } from '@storybook/react'
import LogViewer, {
  ILogViewerProps,
} from 'components/dialogs/LogViewer/LogViewer'
import { mockStore } from 'store/mock/mockStoreTests'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
const defaultProps: ILogViewerProps = {
  log: mockStore.dataStorageService.currentJob.processingErrors,
  okButtonLabel: 'Ok',
  title: 'Job_202209301456 processing log',
}

export default {
  title: 'Dialogs/LogViewer',
  component: LogViewer,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    log: {
      defaultValue: defaultProps.log,
    },
    okButtonLabel: {
      defaultValue: defaultProps.okButtonLabel,
    },
    title: {
      defaultValue: defaultProps.title,
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ILogViewerProps> = (args) => {
  return <LogViewer {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
