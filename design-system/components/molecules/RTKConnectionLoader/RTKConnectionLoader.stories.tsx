import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { RtkServer, RtkServerError } from 'store/features/rtk/types'
import {
  RTKConnectionLoader,
  IRTKConnectionLoaderProps,
} from './RTKConnectionLoader'

const error: RtkServerError = {
  code: 'POS-001',
  description: 'Wrong server or internet connection problem',
}

const defaultProps: Partial<IRTKConnectionLoaderProps> = {
  connectionError: null,
  server: mockStore.rtkService.currentServer,
}

export default {
  title: 'Molecules/RTKConnectionLoader',
  component: RTKConnectionLoader,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    connectionError: {
      control: { type: 'boolean' },
      mapping: { true: error, false: null },
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

const Template: Story<IRTKConnectionLoaderProps> = (args) => {
  return <RTKConnectionLoader {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
