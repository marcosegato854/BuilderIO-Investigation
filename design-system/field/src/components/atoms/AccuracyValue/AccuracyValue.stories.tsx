import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  AccuracyValue,
  IAccuracyValueProps,
} from 'components/atoms/AccuracyValue/AccuracyValue'
import { Accuracy } from 'store/features/position/types'

const defaultProps: IAccuracyValueProps = {
  value: '< 2cm',
  accuracy: 2,
}

export default {
  title: 'Atoms/AccuracyValue',
  component: AccuracyValue,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    accuracy: {
      control: {
        type: 'select',
        options: {
          Bad: Accuracy.Bad,
          Average: Accuracy.Average,
          Good: Accuracy.Good,
        },
      },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IAccuracyValueProps> = (args) => {
  return <AccuracyValue {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
