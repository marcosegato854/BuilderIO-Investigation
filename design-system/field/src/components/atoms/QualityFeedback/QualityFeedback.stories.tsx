import React from 'react'
import { Story, Meta } from '@storybook/react'
import { QualityFeedback, IQualityFeedbackProps } from './QualityFeedback'

const defaultProps: IQualityFeedbackProps = {
  unit: 'cm',
  value: [10, 15],
  min: 1,
  max: 20,
}

export default {
  title: 'Atoms/QualityFeedback',
  component: QualityFeedback,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    unit: {
      defaultValue: defaultProps.unit,
    },
    value: {
      defaultValue: defaultProps.value,
    },
    min: {
      defaultValue: defaultProps.min,
    },
    max: {
      defaultValue: defaultProps.max,
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IQualityFeedbackProps> = (args) => {
  return (
    <div style={{ width: 300 }}>
      <QualityFeedback {...args} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = defaultProps
