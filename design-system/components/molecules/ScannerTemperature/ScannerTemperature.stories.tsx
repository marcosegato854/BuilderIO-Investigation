import React from 'react'
import { Meta, Story } from '@storybook/react'
import { ScannerTemperature } from './ScannerTemperature'
import { mergeDeepRight } from 'ramda'
import { mockStore } from 'store/mock/mockStoreTests'
import configureMockStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { TemperatureStatus } from 'store/features/scanner/types'

export default {
  title: 'Molecules/ScannerTemperature',
  component: ScannerTemperature,
  argTypes: {},
} as Meta

const normalStore = mergeDeepRight(mockStore, {
  scanner: {
    info: [
      {
        position: 'Left',
        temperature: {
          value: 25,
          state: TemperatureStatus.Normal,
        },
      },
      {
        position: 'Right',
        temperature: {
          value: 25,
          state: TemperatureStatus.Normal,
        },
      },
    ],
  },
})
const hesaiScannerNormalStore = configureMockStore()(normalStore)

const Template: Story = (args) => (
  <Provider store={hesaiScannerNormalStore}>
    <ScannerTemperature {...args} />
  </Provider>
)

export const Default = Template.bind({})
Default.args = {}

const highStore = mergeDeepRight(mockStore, {
  scanner: {
    info: [
      {
        position: 'Left',
        temperature: {
          value: 71,
          state: TemperatureStatus.High,
        },
      },
      {
        position: 'Right',
        temperature: {
          value: 70,
          state: TemperatureStatus.High,
        },
      },
    ],
  },
})
const hesaiScannerHighStore = configureMockStore()(highStore)

const HighTemplate: Story = (args) => (
  <Provider store={hesaiScannerHighStore}>
    <ScannerTemperature {...args} />
  </Provider>
)

export const HighTemperature = HighTemplate.bind({})
HighTemperature.args = {}

const WarningStore = mergeDeepRight(mockStore, {
  scanner: {
    info: [
      {
        position: 'Left',
        temperature: {
          value: 81,
          state: TemperatureStatus.Warning,
        },
      },
      {
        position: 'Right',
        temperature: {
          value: 80,
          state: TemperatureStatus.Warning,
        },
      },
    ],
  },
})
const hesaiScannerWarningStore = configureMockStore()(WarningStore)

const WarningTemplate: Story = (args) => (
  <Provider store={hesaiScannerWarningStore}>
    <ScannerTemperature {...args} />
  </Provider>
)

export const WarningTemperature = WarningTemplate.bind({})
WarningTemperature.args = {}

const ErrorStore = mergeDeepRight(mockStore, {
  scanner: {
    info: [
      {
        position: 'Left',
        temperature: {
          value: 95,
          state: TemperatureStatus.Error,
        },
      },
      {
        position: 'Right',
        temperature: {
          value: 96,
          state: TemperatureStatus.Error,
        },
      },
    ],
  },
})
const hesaiScannerErrorStore = configureMockStore()(ErrorStore)

const ErrorTemplate: Story = (args) => (
  <Provider store={hesaiScannerErrorStore}>
    <ScannerTemperature {...args} />
  </Provider>
)

export const ErrorTemperature = ErrorTemplate.bind({})
ErrorTemperature.args = {}
