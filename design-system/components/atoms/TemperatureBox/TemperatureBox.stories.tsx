import React from 'react'
import { Story, Meta } from '@storybook/react'
import { TemperatureBox, ITemperatureBoxProps } from './TemperatureBox'
import { Unit } from 'components/dialogs/NewProjectForm/NewProjectForm'
import { TemperatureStatus } from 'store/features/scanner/types'

const defaultProps: ITemperatureBoxProps = {
  temperature: 25,
  status: TemperatureStatus.Normal,
  label: 'Temperature',
  unit: Unit.Metric,
}

export default {
  title: 'Atoms/TemperatureBox',
  component: TemperatureBox,
  argTypes: {
    status: {
      name: 'Status',
      control: {
        type: 'select',
        options: Object.values(TemperatureStatus),
      },
    },
    unit: {
      name: 'Unit',
      control: {
        type: 'select',
        options: [Unit.Metric, Unit.Imperial],
      },
    },
  },
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ITemperatureBoxProps> = (args) => {
  return <TemperatureBox {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
