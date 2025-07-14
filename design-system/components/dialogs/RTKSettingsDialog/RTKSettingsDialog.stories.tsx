import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Provider } from 'react-redux'
import { mockStore } from 'store/mock/mockStoreTests'
import configureMockStore from 'redux-mock-store'

import RTKSettingsDialog from './RTKSettingsDialog'

const mockedStore = configureMockStore()(mockStore)
// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
// const defaultOptions: Array<IClickableOption> = [
//   {
//     value: 'edit',
//     label: 'Edit Project',
//   }
// ]

export default {
  title: 'Dialogs/RTKSettingsDialog',
  component: RTKSettingsDialog,
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
  return <RTKSettingsDialog {...args} />
}

const TemplateMocked: Story = (args) => {
  return (
    <Provider store={mockedStore}>
      <RTKSettingsDialog {...args} />
    </Provider>
  )
}

export const Default = Template.bind({})
export const MockedStore = TemplateMocked.bind({})
Default.args = {}
