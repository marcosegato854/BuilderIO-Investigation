import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { Provider } from 'react-redux'
import { Story, Meta } from '@storybook/react'
import { DataAcquisitionStatusBar } from 'components/molecules/DataAcquisitionStatusBar/DataAcquisitionStatusBar'
import { OptimizedRootState as OptimizedRootStateDataStorage } from 'store/features/dataStorage/slice'
import { OptimizedRootState as OptimizedRootStatePosition } from 'store/features/position/slice'
import { mergeDeepRight } from 'ramda'

const mockStoreRTKDataStorage: OptimizedRootStateDataStorage = {
  ...mockStore,
  dataStorageService: {
    ...mockStore.dataStorageService,
    currentJob: {
      ...mockStore.dataStorageService.currentJob!,
      ntrip: {
        enable: false,
      },
    },
  },
}
const mockStoreRTKPosition: OptimizedRootStatePosition = {
  positionService: {
    positionState: {
      // gdop: 18.4567897,
      gdop: null,
      // gdop: 188.4567897,
      status: {
        friendlystate: 0,
      },
    },
  },
}
const mockStoreRTK = mergeDeepRight(mockStore, {
  ...mockStoreRTKDataStorage,
  ...mockStoreRTKPosition,
})
const InitialValuesStoreRTK = configureMockStore()(mockStoreRTK)

export default {
  title: 'Molecules/DataAcquisitionStatusBar',
  component: DataAcquisitionStatusBar,
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story = (args) => {
  return (
    <Provider store={InitialValuesStoreRTK}>
      <DataAcquisitionStatusBar {...args} />
    </Provider>
  )
}

export const Default = Template.bind({})
Default.args = {}

const mockStoreNoRTK: OptimizedRootStateDataStorage = mergeDeepRight(
  mockStore,
  {
    dataStorageService: {
      currentJob: {
        ntrip: {
          enable: true,
        },
      },
    },
    positionService: {
      positionState: {
        status: {
          friendlystate: 3,
        },
      },
    },
  }
)
const InitialValuesStoreNoRTK = configureMockStore()(mockStoreNoRTK)

const TemplateMockStoreRTK: Story = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={InitialValuesStoreNoRTK}>
        <DataAcquisitionStatusBar {...args} />
      </Provider>
    </div>
  )
}

export const MockStoreRTK = TemplateMockStoreRTK.bind({})
MockStoreRTK.args = {}
