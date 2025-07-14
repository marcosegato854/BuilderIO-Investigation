import { Story, Meta } from '@storybook/react'
import JobProcessingOptions, {
  IJobProcessingOptionsProps,
} from 'components/molecules/JobProcessingOptions/JobProcessingOptions'
import {
  JobProcessStatus,
  ProcessingProgressInfo,
} from 'store/features/dataStorage/types'

/**
 * ALL THE INTERACTIONS ARE SHOWN ON THE ProcessingDialog component
 */

const job: IJob = {
  name: 'Job001',
  acquired: true,
  scans: 1,
}

const emptyLayoutOptions: ProcessingProgressInfo = {
  action: null,
  progress: 0,
  currentStatus: JobProcessStatus.NONE,
  isImageAI: false,
}

const emptyOptions: ProcessingOptions = {
  export: {
    las: {
      enable: false,
      done: false,
    },
    lgsx: {
      enable: false,
      done: false,
    },
    e57: {
      enable: false,
      done: false,
    },
  },
  finalise: {
    blur: {
      enable: false,
      done: false,
    },
    colorization: {
      enable: false,
      done: false,
    },
  },
}

const defaultProps: IJobProcessingOptionsProps = {
  job,
  processingOptions: emptyOptions,
  processingLayout: emptyLayoutOptions,
}

export default {
  title: 'Molecules/JobProcessingOptions',
  component: JobProcessingOptions,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IJobProcessingOptionsProps> = (args) => {
  return <JobProcessingOptions {...args} />
}
export const Default = Template.bind({})
Default.args = defaultProps
