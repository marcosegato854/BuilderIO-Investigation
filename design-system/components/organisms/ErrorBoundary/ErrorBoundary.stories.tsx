import React from 'react'
import { Story, Meta } from '@storybook/react'
import { ErrorBoundary, IErrorBoundaryProps } from './ErrorBoundary'

export default {
  title: 'Organisms/ErrorBoundary',
  component: ErrorBoundary,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IErrorBoundaryProps> = (args) => {
  return <ErrorBoundary {...args} />
}

export const Default = Template.bind({})
Default.args = {}
