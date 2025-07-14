import { Meta, Story } from '@storybook/react'
import {
  FinalAlignmentButton,
  IFinalAlignmentButtonProps,
} from 'components/atoms/FinalAlignmentButton/FinalAlignmentButton'
import React from 'react'
import icons from 'components/atoms/Icon/icons'

const defaultProps: Partial<IFinalAlignmentButtonProps> = {
  busy: false,
  icon: 'Search',
  label: 'Final Alignment',
  labelSecondary: 'Deactivate',
}

export default {
  title: 'Atoms/FinalAlignmentButton',
  component: FinalAlignmentButton,
  argTypes: {
    icon: {
      control: {
        type: 'select',
        options: Object.keys(icons),
      },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IFinalAlignmentButtonProps> = (args) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh', // otherwise it will occupy only the needed space and the button won't be placed in the center
      }}
    >
      <FinalAlignmentButton
        {...args}
        label="Start Acquisition"
        // icon="PowerButton"
      />
    </div>
  )
}
export const Default = Template.bind({})
Default.args = defaultProps

const TemplateWithSecondaryButton: Story<IFinalAlignmentButtonProps> = (
  args
) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh', // otherwise it will occupy only the needed space and the button won't be placed in the center
      }}
    >
      <FinalAlignmentButton
        {...args}
        label="Processing"
        onClickSecondary={() => {}}
      />
    </div>
  )
}

export const WithSecondaryButton = TemplateWithSecondaryButton.bind({})
WithSecondaryButton.args = defaultProps
