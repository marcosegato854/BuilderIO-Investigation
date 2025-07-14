import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Provider } from 'react-redux'
import { mockStore } from 'store/mock/mockStoreTests'
import configureMockStore from 'redux-mock-store'
import { mergeDeepRight } from 'ramda'
import { AlignmentPhase } from 'store/features/alignment/types'
import { RoutingToast } from './RoutingToast'

export default {
  title: 'Molecules/RoutingToast',
  component: RoutingToast,
  argTypes: {},
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const StoreDefault = configureMockStore()({
  ...mockStore,
})

const TemplateDefault: Story = (args) => {
  return (
    <Provider store={StoreDefault}>
      <RoutingToast {...args} />
    </Provider>
  )
}

export const Default = TemplateDefault.bind({})
Default.args = {}

/** SimpleDirection */
const StoreSimpleDirection = configureMockStore()(
  mergeDeepRight(mockStore, {
    alignmentService: {
      alignmentState: {
        alignmentPhase: AlignmentPhase.INITIAL_DONE,
      },
      alignmentSocketConnected: false,
    },
    routingService: {
      routingEnabled: true,
    },
  })
)

const TemplateSimpleDirection: Story = (args) => {
  return (
    <Provider store={StoreSimpleDirection}>
      <RoutingToast {...args} />
    </Provider>
  )
}

export const SimpleDirection = TemplateSimpleDirection.bind({})
SimpleDirection.args = {}

/** WithStoppingNotification */
const StoreWithStoppingNotification = configureMockStore()(
  mergeDeepRight(mockStore, {
    alignmentService: {
      alignmentState: {
        alignmentPhase: AlignmentPhase.INITIAL_DONE,
      },
      alignmentSocketConnected: false,
    },
    routingService: {
      routingEnabled: true,
      autocaptureNotifications: [
        {
          id: 1,
          time: '2021-11-24T09:36:01',
          type: 0,
          code: 'STT-002',
          description: 'Automatic stop recording in {p1} seconds',
          p1: '5',
        },
      ],
    },
  })
)

const TemplateWithStoppingNotification: Story = (args) => {
  return (
    <Provider store={StoreWithStoppingNotification}>
      <RoutingToast {...args} />
    </Provider>
  )
}

export const WithStoppingNotification = TemplateWithStoppingNotification.bind(
  {}
)
WithStoppingNotification.args = {}

/** OnlyNotification */
const StoreOnlyNotification = configureMockStore()(
  mergeDeepRight(mockStore, {
    alignmentService: {
      alignmentState: {
        alignmentPhase: AlignmentPhase.INITIAL_DONE,
      },
      alignmentSocketConnected: false,
    },
    routingService: {
      routingEnabled: true,
      routingState: null,
      autocaptureNotifications: [
        {
          id: 1,
          time: '2021-11-24T09:36:01',
          type: 0,
          code: 'STT-002',
          description: 'Automatic stop recording in {p1} seconds',
          p1: '5',
        },
      ],
    },
  })
)

const TemplateOnlyNotification: Story = (args) => {
  return (
    <Provider store={StoreOnlyNotification}>
      <RoutingToast {...args} />
    </Provider>
  )
}

export const OnlyNotification = TemplateOnlyNotification.bind({})
OnlyNotification.args = {}
