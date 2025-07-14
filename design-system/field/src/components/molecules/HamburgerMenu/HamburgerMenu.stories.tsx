import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { HamburgerMenu } from './HamburgerMenu'
import { mergeDeepRight } from 'ramda'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
// const defaultProps: IHamburgerMenuProps = {
//   propertyA: 'hello',
//   propertyB: true,
// }
const mockedStore = configureMockStore()(mockStore)
const mergedStore = mergeDeepRight(mockStore, {
  system: {
    responsiveness: {
      battery: {
        details: {
          batteries: [
            {
              id: 1,
              name: 'Battery 1',
              health: 20,
              critical: false,
              description: 'Battery 1 description',
              minutes: 5,
              charging: false,
              active: true,
            },
            {
              id: 2,
              name: 'Battery 2',
              health: 10,
              critical: true,
              description: 'Battery 2 description',
              minutes: 1,
              charging: false,
              active: true,
            },
          ],
        },
      },
    },
  },
})
const mockedStoreBattery = configureMockStore()(mergedStore)

export default {
  title: 'Molecules/HamburgerMenu',
  component: HamburgerMenu,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    // propertyA: {
    //   defaultValue: defaultProps.propertyA,
    // },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story = (args) => {
  return <HamburgerMenu {...args} />
}

export const Default = Template.bind({})
Default.args = {}

const TemplateMockStore: Story = (args) => {
  return (
    <Provider store={mockedStore}>
      <HamburgerMenu {...args} />
    </Provider>
  )
}

export const MockStore = TemplateMockStore.bind({})
Default.args = {}

const TemplateMockStoreBatteryLow: Story = (args) => {
  return (
    <Provider store={mockedStoreBattery}>
      <HamburgerMenu {...args} />
    </Provider>
  )
}

export const MockStoreBatteryLow = TemplateMockStoreBatteryLow.bind({})
Default.args = {}
