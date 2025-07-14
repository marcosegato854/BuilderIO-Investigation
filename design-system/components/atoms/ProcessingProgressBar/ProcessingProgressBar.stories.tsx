import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  ProcessingProgressBar,
  IProcessingProgressBarProps,
} from 'components/atoms/ProcessingProgressBar/ProcessingProgressBar'
import { JobProcessStatus } from 'store/features/dataStorage/types'

const defaultProps: IProcessingProgressBarProps = {
  label: 'Processing label',
  progress: 30,
  status: JobProcessStatus.DONE,
}

export default {
  title: 'Atoms/ProcessingProgressBar',
  component: ProcessingProgressBar,
  argTypes: {
    status: {
      control: {
        type: 'select',
        options: JobProcessStatus,
      },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IProcessingProgressBarProps> = (args) => {
  return <ProcessingProgressBar {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
