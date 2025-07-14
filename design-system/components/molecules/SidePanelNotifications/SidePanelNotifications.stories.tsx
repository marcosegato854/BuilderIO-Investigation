import { Meta, Story } from '@storybook/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import {
  ISidePanelNotificationsProps,
  SidePanelNotifications,
} from './SidePanelNotifications'

const mockedStore = configureMockStore()(mockStore)

export default {
  title: 'Molecules/SidePanelNotifications',
  component: SidePanelNotifications,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    // notifications: {
    //   defaultValue: defaultProps.notifications,
    // },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ISidePanelNotificationsProps> = (args) => {
  return (
    <Provider store={mockedStore}>
      <SidePanelNotifications {...args} />
    </Provider>
  )
}

export const Default = Template.bind({})
Default.args = {}
