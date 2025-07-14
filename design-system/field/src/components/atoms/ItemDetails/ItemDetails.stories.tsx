import { Meta, Story } from '@storybook/react'
import {
  IItemDetailsProps,
  ItemDetails,
} from 'components/atoms/ItemDetails/ItemDetails'
import { mergeDeepRight } from 'ramda'
import React from 'react'
import { mockStore } from 'store/mock/mockStoreTests'
import { getDetails } from 'utils/jobs'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
const defaultProps: IItemDetailsProps = {
  details: [
    {
      primary: 'Creation Date',
      secondary: '06/05/2021',
    },
    {
      primary: 'Project Unit',
      secondary: 'Metric',
    },
    {
      primary: 'Coordinate System',
      secondary: 'WGS 84 / UTM 32N',
    },
    {
      primary: 'Control Point',
      secondary: 'Not Available',
    },
    {
      primary: 'Project Size',
      secondary: '5GB Estimated',
    },
  ],
  variant: 'plainStyle',
}

export default {
  title: 'Atoms/ItemDetails',
  component: ItemDetails,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    details: {
      defaultValue: defaultProps.details,
    },
    variant: {
      defaultValue: defaultProps.variant,
      control: {
        type: 'select',
        options: ['plainStyle', 'bulletListStyle'],
      },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta
const Template: Story<IItemDetailsProps> = (args) => {
  return <ItemDetails {...args} />
}
export const Default = Template.bind({})
Default.args = defaultProps

/** JOB */
const TemplateJob: Story<IItemDetailsProps> = (args) => {
  return (
    <ItemDetails
      {...{
        ...args,
        details: getDetails(mockStore.dataStorageService.currentJob, 'metric'),
      }}
    />
  )
}
export const Job = TemplateJob.bind({})
Job.args = defaultProps

/** NO CAMERA */
const jobWithNoCamera = mergeDeepRight(
  mockStore.dataStorageService.currentJob,
  {
    camera: {
      enable: 0,
    },
  }
) as IJob
const TemplateNoCamera: Story<IItemDetailsProps> = (args) => {
  return (
    <ItemDetails
      {...{
        ...args,
        details: getDetails(jobWithNoCamera, 'metric'),
      }}
    />
  )
}
export const NoCamera = TemplateNoCamera.bind({})
NoCamera.args = defaultProps

/** TIME CAMERA */
const jobWithTimeCamera = mergeDeepRight(
  mockStore.dataStorageService.currentJob,
  {
    camera: {
      enable: 2,
    },
  }
) as IJob
const TemplateTimeCamera: Story<IItemDetailsProps> = (args) => {
  return (
    <ItemDetails
      {...{
        ...args,
        details: getDetails(jobWithTimeCamera, 'metric'),
      }}
    />
  )
}
export const TimeCamera = TemplateTimeCamera.bind({})
TimeCamera.args = defaultProps

/** SN */
const jobWithSerialNumber = mergeDeepRight(
  mockStore.dataStorageService.currentJob,
  {
    camera: {
      enable: 2,
    },
    snSensorUnit: 'ASKDHHSADG-GSEGAAGS-GEGGSSE',
  }
) as IJob
const TemplateSerialNumber: Story<IItemDetailsProps> = (args) => {
  return (
    <ItemDetails
      {...{
        ...args,
        details: getDetails(jobWithSerialNumber, 'metric'),
      }}
    />
  )
}
export const SerialNumber = TemplateSerialNumber.bind({})
SerialNumber.args = defaultProps

/** PROJECt */
const TemplateProject: Story<IItemDetailsProps> = (args) => {
  return (
    <ItemDetails
      {...{
        ...args,
        details: getDetails(
          mockStore.dataStorageService.currentProject,
          'metric'
        ),
      }}
    />
  )
}
export const Project = TemplateProject.bind({})
Project.args = defaultProps
