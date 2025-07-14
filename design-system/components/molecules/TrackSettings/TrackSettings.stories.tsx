import React from 'react'
import { Meta, Story } from '@storybook/react'
import { mergeDeepRight } from 'ramda'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import {
  ITrackSettingsProps,
  TrackSettings,
} from 'components/molecules/TrackSettings/TrackSettings'

const defaultProps: Partial<ITrackSettingsProps> = {
  track: mockStore.planningService.undoablePolygons.present[0],
  isReadOnly: false,
}

export default {
  title: 'Molecules/TrackSettings',
  component: TrackSettings,
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ITrackSettingsProps> = (args) => {
  return <TrackSettings {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps

/** AdminUser */
const AdminUserStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    authService: {
      userInfo: {
        usertype: 'service',
      },
    },
  })
)
const TemplateAdminUser: Story<ITrackSettingsProps> = (args) => {
  return (
    <Provider store={AdminUserStore}>
      <TrackSettings {...args} />
    </Provider>
  )
}
export const AdminUser = TemplateAdminUser.bind({})
AdminUser.args = defaultProps

/** WithRouting */
const WithRoutingStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    routingService: {
      moduleEnabled: true,
    },
  })
)
const TemplateWithRouting: Story<ITrackSettingsProps> = (args) => {
  return (
    <Provider store={WithRoutingStore}>
      <TrackSettings {...args} />
    </Provider>
  )
}
export const WithRouting = TemplateWithRouting.bind({})
WithRouting.args = defaultProps

/** WithoutRouting */
const WithoutRoutingStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    routingService: {
      moduleEnabled: false,
    },
  })
)
const TemplateWithoutRouting: Story<ITrackSettingsProps> = (args) => {
  return (
    <Provider store={WithoutRoutingStore}>
      <TrackSettings {...args} />
    </Provider>
  )
}
export const WithoutRouting = TemplateWithoutRouting.bind({})
WithoutRouting.args = defaultProps
