import React from 'react'
import { Story, Meta } from '@storybook/react'
import moment from 'moment'
import PlanQualityForm, { IPlanQualityFormProps } from './PlanQualityForm'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
// const defaultOptions: Array<IClickableOption> = [
//   {
//     value: 'edit',
//     label: 'Edit Project',
//   }
// ]
const planQualityProps = {
  distance: '< 20m',
  distances: ['< 5m', '< 20m', '< 40m', '< 100m'],
  captureDate: new Date('2019-01-16'),
  captureStart: new Date('2019-01-16T10:30:00Z'),
  captureEnd: new Date('2019-01-16T11:30:00Z'),
  satellites: [
    { time: '00:00', nr: 5 },
    { time: '01:00', nr: 12 },
    { time: '01:00', nr: 14 },
    { time: '01:30', nr: 5 },
    { time: '02:00', nr: 21 },
    { time: '02:30', nr: 5 },
    { time: '03:00', nr: 9 },
    { time: '03:30', nr: 5 },
    { time: '04:00', nr: 4 },
    { time: '04:30', nr: 5 },
    { time: '05:00', nr: 7 },
    { time: '05:30', nr: 5 },
    { time: '06:00', nr: 2 },
    { time: '06:30', nr: 5 },
    { time: '07:00', nr: 23 },
    { time: '07:30', nr: 5 },
    { time: '08:00', nr: 21 },
    { time: '08:30', nr: 5 },
    { time: '09:00', nr: 5 },
    { time: '09:30', nr: 5 },
    { time: '10:00', nr: 6 },
    { time: '10:30', nr: 5 },
    { time: '11:00', nr: 14 },
    { time: '11:30', nr: 5 },
    { time: '12:00', nr: 5 },
    { time: '12:30', nr: 5 },
    { time: '13:00', nr: 7 },
    { time: '13:30', nr: 5 },
    { time: '14:00', nr: 5 },
    { time: '14:30', nr: 5 },
    { time: '15:00', nr: 9 },
    { time: '15:30', nr: 5 },
    { time: '16:00', nr: 4 },
    { time: '16:30', nr: 5 },
    { time: '17:00', nr: 7 },
    { time: '17:30', nr: 5 },
    { time: '18:00', nr: 2 },
    { time: '18:30', nr: 5 },
    { time: '19:00', nr: 23 },
    { time: '19:30', nr: 5 },
    { time: '20:00', nr: 21 },
    { time: '20:30', nr: 5 },
    { time: '21:00', nr: 5 },
    { time: '21:30', nr: 5 },
    { time: '22:00', nr: 6 },
    { time: '22:30', nr: 5 },
    { time: '23:00', nr: 14 },
    { time: '23:30', nr: 5 },
  ],
  accuracyForecast: [
    { type: 'Low', value: 30 },
    { type: 'Mid', value: 20 },
    { type: 'High', value: 50 },
  ],
}

export default {
  title: 'Dialogs/PlanQualityForm',
  component: PlanQualityForm,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    /*  distance: {
      defaultValue: planQualityProps.distance,
    },
    distances: {
      defaultValue: planQualityProps.distances,
    },
    captureDate: {
      defaultValue: planQualityProps.captureDate,
    },
    captureStart: {
      defaultValue: planQualityProps.captureStart,
    },
    captureEnd: {
      defaultValue: planQualityProps.captureEnd,
    },
    satellites: {
      defaultValue: planQualityProps.satellites,
    },
    accuracyForecast: {
      defaultValue: planQualityProps.accuracyForecast,
    }, */
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IPlanQualityFormProps> = (args) => {
  return <PlanQualityForm {...args} />
}

export const Default = Template.bind({})
Default.args = planQualityProps
