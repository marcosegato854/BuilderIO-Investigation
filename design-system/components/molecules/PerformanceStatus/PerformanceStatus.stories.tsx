import { Meta, Story } from '@storybook/react'
import {
  IPerformanceStatusProps,
  PerformanceStatus,
} from 'components/molecules/PerformanceStatus/PerformanceStatus'
import { DeepPartial, mergeDeepRight } from 'ramda'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { OptimizedRootState as OptimizedRootStateDataStorage } from 'store/features/dataStorage/slice'
import { OptimizedRootState as OptimizedRootStateSystem } from 'store/features/system/slice'
import { ResponsivenessBattery } from 'store/features/system/types'
import { mockStore } from 'store/mock/mockStoreTests'

const { system, connection, battery, storage,usersConnected } =
  mockStore.system.responsiveness!

const defaultProps: IPerformanceStatusProps = {
  system,
  connection,
  battery,
  storage,
  usersConnected
}

export default {
  title: 'Molecules/PerformanceStatus',
  component: PerformanceStatus,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IPerformanceStatusProps> = (args) => {
  return <PerformanceStatus {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps

const gdprOverrides: DeepPartial<OptimizedRootStateDataStorage> = {
  dataStorageService: {
    currentJob: {
      camera: {
        enable: 1,
        blur: false,
      },
    },
  },
}
const mockStoreGDPR = mergeDeepRight(mockStore, gdprOverrides)
const InitialValuesStoreGDPR = configureMockStore()(mockStoreGDPR)
const TemplateGDPR: Story<IPerformanceStatusProps> = (args) => {
  return (
    <Provider store={InitialValuesStoreGDPR}>
      <PerformanceStatus {...args} />
    </Provider>
  )
}

export const MockStoreGDPR = TemplateGDPR.bind({})
MockStoreGDPR.args = defaultProps

const acOverrides: DeepPartial<OptimizedRootStateSystem> = {
  system: {
    responsiveness: {
      battery: {
        acplug: true,
        charging: false,
        health: 75,
      },
    },
  },
}
const mockStoreAC = mergeDeepRight(mockStore, acOverrides)
const InitialValuesStoreAC = configureMockStore()(mockStoreAC)
const TemplateAC: Story<IPerformanceStatusProps> = (args) => {
  return (
    <Provider store={InitialValuesStoreAC}>
      <PerformanceStatus
        {...args}
        battery={
          acOverrides.system?.responsiveness?.battery as ResponsivenessBattery
        }
      />
    </Provider>
  )
}

export const MockStoreAC = TemplateAC.bind({})
MockStoreAC.args = defaultProps

const noProcessingOverrides: DeepPartial<OptimizedRootStateDataStorage> = {
  dataStorageService: {
    processing: {
      imageAI: undefined,
      office: undefined,
    },
  },
}
const mockStoreNoProcessing = mergeDeepRight(mockStore, noProcessingOverrides)
const InitialValuesStoreNoProcessing = configureMockStore()(
  mockStoreNoProcessing
)
const TemplateNoProcessing: Story<IPerformanceStatusProps> = (args) => {
  return (
    <Provider store={InitialValuesStoreNoProcessing}>
      <PerformanceStatus {...args} />
    </Provider>
  )
}

export const MockStoreNoProcessing = TemplateNoProcessing.bind({})
MockStoreNoProcessing.args = defaultProps
