import React from 'react'
import { Story, Meta } from '@storybook/react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { Provider } from 'react-redux'
import { mergeDeepRight } from 'ramda'
import { RTKConnectionInfo } from './RTKConnectionInfo'

const mockedStore = configureMockStore()(mockStore)

export default {
  title: 'Molecules/RTKConnectionInfo',
  component: RTKConnectionInfo,
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
  return <RTKConnectionInfo {...args} />
}
export const Default = Template.bind({})
Default.args = {}

const TemplateMocked: Story = (args) => {
  return (
    <Provider store={mockedStore}>
      <RTKConnectionInfo {...args} />
    </Provider>
  )
}
export const Mocked = TemplateMocked.bind({})
Mocked.args = {}

const mockedStoreAge = configureMockStore()(
  mergeDeepRight(mockStore, {
    rtkService: {
      testInfo: {
        ntripconnection: false,
        agecorrection: '0.1',
      },
    },
  })
)
const TemplateAgeOfCorrection: Story = (args) => {
  return (
    <Provider store={mockedStoreAge}>
      <RTKConnectionInfo {...args} />
    </Provider>
  )
}
export const AgeOfCorrection = TemplateAgeOfCorrection.bind({})
AgeOfCorrection.args = {}
