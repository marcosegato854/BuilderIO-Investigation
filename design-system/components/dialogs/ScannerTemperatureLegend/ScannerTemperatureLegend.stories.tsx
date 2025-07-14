import { Meta, Story } from '@storybook/react'
import { Unit } from 'components/dialogs/NewProjectForm/NewProjectForm'
import ScannerTemperatureLegend from './ScannerTemperatureLegend'

export default {
  title: 'Dialogs/ScannerTemperatureLegend',
  component: ScannerTemperatureLegend,
  argTypes: {
    unit: {
      name: 'Unit',
      defaultValue: Unit.Metric,
      control: {
        type: 'select',
        options: [Unit.Metric, Unit.Imperial],
      },
    },
  },
} as Meta

const Template: Story = (args) => <ScannerTemperatureLegend {...args} />

export const Default = Template.bind({})
Default.args = {
  // Add default props here
}
