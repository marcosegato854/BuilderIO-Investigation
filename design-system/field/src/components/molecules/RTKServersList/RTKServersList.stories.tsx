import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { RTKServersList } from './RTKServersList'

const mockedStore = configureMockStore()(mockStore)

export default {
  title: 'Molecules/RTKServersList',
  component: RTKServersList,
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const TemplateMocked: Story = (args) => {
  return (
    <Provider store={mockedStore}>
      <RTKServersList {...args} />
    </Provider>
  )
}

export const Mocked = TemplateMocked.bind({})
Mocked.args = {}
