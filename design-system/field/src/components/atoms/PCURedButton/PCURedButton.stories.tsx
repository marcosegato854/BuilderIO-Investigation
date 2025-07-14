import React from 'react'
import { Story, Meta } from '@storybook/react'
import { PCURedButton, IPCURedButtonProps } from './PCURedButton'
import { mockStore } from 'store/mock/mockStoreTests'
import { PCUApp_VIEWPORT } from '../../../../.storybook/preview'

const { system, connection, battery, storage } =
  mockStore.system.responsiveness!

const defaultProps: Partial<IPCURedButtonProps> = {
  icon: 'Plus',
  title: 'Capture',
  onClick: undefined,
}

export default {
  title: 'Atoms/PCURedButton',
  component: PCURedButton,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    // options: {
    //   defaultValue: defaultOptions,
    // },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: {
    actions: { argTypesRegex: '^on.*' },
  },
} as Meta

//Default

const Template: Story<IPCURedButtonProps> = (args) => {
  return <PCURedButton {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
