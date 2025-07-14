import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import { mockStore } from 'store/mock/mockStoreTests'
import { ViewMode } from 'store/features/position/types'
import { Acquisition, IAcquisitionProps } from 'pages/Acquisition/Acquisition'

const InitialValuesStore = configureMockStore()({
  ...mockStore,
  system: {
    ...mockStore.system,
    realTimeNotifications: [],
  },
  actionsService: {
    ...mockStore.actionsService,
    activationProgress: 100,
    acquisitionReady: true,
  },
  positionService: {
    ...mockStore.positionService,
    viewMode: ViewMode.MAP,
    pointcloudActive: true,
    positionSocketConnected: true,
  },
})

export default {
  title: 'Pages/Acquisition',
  component: Acquisition,
  argTypes: {},
  parameters: { actions: { argTypesRegex: '^on.*' } },
  args: {},
} as Meta

/**
 * Pages need the MemoryRouter to simulate ConnectedRouter
 */
const Template: Story<IAcquisitionProps> = (args) => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Route
        component={(routerProps: RouteComponentProps) => {
          return <Acquisition {...args} {...routerProps} />
        }}
        path="/"
      />
    </MemoryRouter>
  )
}

export const Default = Template.bind({})
Default.args = {}

const TemplateMockStore: Story = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={InitialValuesStore}>
        <MemoryRouter initialEntries={['/']}>
          <Route
            component={(routerProps: RouteComponentProps) => {
              return <Acquisition {...args} {...routerProps} />
            }}
            path="/"
          />
        </MemoryRouter>
      </Provider>
    </div>
  )
}

export const MockStore = TemplateMockStore.bind({})
MockStore.args = {}
