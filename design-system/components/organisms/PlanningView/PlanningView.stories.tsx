import React from 'react'
import { Story, Meta } from '@storybook/react'
import configureMockStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { mockStore } from 'store/mock/mockStoreTests'
import { MapNavigationMode, ViewMode } from 'store/features/position/types'
import { MemoryRouter } from 'react-router-dom'
import { PlanningView } from './PlanningView'

const InitialValuesStore = configureMockStore()({
  ...mockStore,
  // needs to be specific for planning
  positionService: {
    positionState: null,
    supportedSatellites: ['gps', 'beidou'],
    navigationMode: MapNavigationMode.NONE,
    viewMode: ViewMode.MAP,
    cameraZoom: 0,
  },
})

export default {
  title: 'Organisms/PlanningView',
  component: PlanningView,
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
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <MemoryRouter initialEntries={['/']}>
        <PlanningView {...args} />
      </MemoryRouter>
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {}

const TemplateMockStore: Story = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={InitialValuesStore}>
        <MemoryRouter initialEntries={['/']}>
          <PlanningView {...args} />
        </MemoryRouter>
      </Provider>
    </div>
  )
}

export const MockStore = TemplateMockStore.bind({})
MockStore.args = {}
