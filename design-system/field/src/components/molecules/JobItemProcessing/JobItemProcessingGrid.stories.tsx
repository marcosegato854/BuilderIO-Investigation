import React from 'react'
import { Story, Meta } from '@storybook/react'
import image from 'assets/jpg/England2.jpg'
import {
  JobProcessStatus,
  ProcessingProgressInfo,
} from 'store/features/dataStorage/types'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import {
  JobItemProcessingGrid,
  IJobItemProcessingGridProps,
} from 'components/molecules/JobItemProcessing/JobItemProcessingGrid'
import { Icon } from 'components/atoms/Icon/Icon'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
// const defaultProps: IJobItemProcessingProps = {
//   propertyA: 'hello',
//   propertyB: true,
// }
/* const viewMode = GridVariant.ListView */
const job: IJob = {
  name: 'Very very Long title description to check ellipsis working',
  scans: 20,
  image,
  completed: 10,
}

const processingOptions: ProcessingProgressInfo = {
  action: <Icon name="RoundPause" />,
  progress: 75,
  currentStatus: JobProcessStatus.PLAY,
}

export default {
  title: 'Molecules/JobItemProcessingGrid',
  component: JobItemProcessingGrid,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    /* viewMode: {
      defaultValue: viewMode,
    }, */
    job: {
      defaultValue: job,
    },
    processingOptions: {
      defaultValue: processingOptions,
    },
    // 2) Assign the default value to the related property inside of argTypes{}
    // propertyA: {
    //   defaultValue: defaultProps.propertyA,
    // },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const TemplateProcessing: Story<IJobItemProcessingGridProps> = (args) => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Route
        component={(routerProps: RouteComponentProps) => {
          return <JobItemProcessingGrid {...args} {...routerProps} />
        }}
        path="/"
      />
    </MemoryRouter>
  )
}

export const Processing = TemplateProcessing.bind({})
Processing.args = {}

const TemplatePaused: Story<IJobItemProcessingGridProps> = (args) => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Route
        component={(routerProps: RouteComponentProps) => {
          return <JobItemProcessingGrid {...args} {...routerProps} />
        }}
        path="/"
      />
    </MemoryRouter>
  )
}

export const Paused = TemplatePaused.bind({})
Paused.args = {
  processingOptions: {
    action: null,
    progress: 50,
    currentStatus: JobProcessStatus.PAUSE,
  },
}

const TemplateDone: Story<IJobItemProcessingGridProps> = (args) => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Route
        component={(routerProps: RouteComponentProps) => {
          return <JobItemProcessingGrid {...args} {...routerProps} />
        }}
        path="/"
      />
    </MemoryRouter>
  )
}

export const Done = TemplateDone.bind({})
Done.args = {
  processingOptions: {
    action: <Icon name="RoundPlay" />,
    progress: 100,
    currentStatus: JobProcessStatus.DONE,
  },
  job: {
    name: 'Very very Long title description to check ellipsis working',
    scans: 20,
    image,
    completed: 10,
  },
}

const TemplateError: Story<IJobItemProcessingGridProps> = (args) => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Route
        component={(routerProps: RouteComponentProps) => {
          return <JobItemProcessingGrid {...args} {...routerProps} />
        }}
        path="/"
      />
    </MemoryRouter>
  )
}

export const Error = TemplateError.bind({})
Error.args = {
  processingOptions: {
    action: null,
    progress: 50,
    currentStatus: JobProcessStatus.ERROR,
  },
}
