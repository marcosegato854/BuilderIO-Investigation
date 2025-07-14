import React from 'react'
import { Story, Meta } from '@storybook/react'
import { InitializationManager } from 'components/molecules/InitializationManager/InitializationManager'
import { Provider } from 'react-redux'
import { mergeDeepRight } from 'ramda'
import { mockStore } from 'store/mock/mockStoreTests'
import configureMockStore from 'redux-mock-store'

/**
 * DEFAULT
 */

const overrides = {
  system: {
    notifications: [
      {
        id: 1,
        time: '2022-04-06T12:57:12',
        type: 1,
        code: 'SCN-007',
        description: 'The firmware of FrontSLAM is unsupported',
        p1: 'FrontSLAM',
      },
      {
        id: 2,
        time: '2022-04-06T12:59:49',
        type: 0,
        code: 'DS-001',
        description:
          'Disk change detected, please check on the top bar for the disks available',
      },
    ],
    systemState: {
      state: 'Initializing',
    },
  },
}
const mergedStore = mergeDeepRight(mockStore, overrides)
const InitialValuesStore = configureMockStore()(mergedStore)

export default {
  title: 'Molecules/InitializationManager',
  component: InitializationManager,
  argTypes: {},
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story = (args) => {
  return (
    <Provider store={InitialValuesStore}>
      <InitializationManager {...args} />
    </Provider>
  )
}

export const Default = Template.bind({})
Default.args = {}

/**
 * WITH ERRORS
 */
const overridesWithErrors = {
  system: {
    notifications: [
      {
        id: 1,
        time: '2022-04-06T12:57:12',
        type: 2,
        code: 'SCN-007',
        description: 'The firmware of FrontSLAM is unsupported',
        p1: 'FrontSLAM',
      },
      {
        id: 2,
        time: '2022-04-06T12:59:49',
        type: 2,
        code: 'DS-001',
        description:
          'Disk change detected, please check on the top bar for the disks available',
      },
    ],
  },
}
const mergedStoreWithErrors = mergeDeepRight(mergedStore, overridesWithErrors)
const InitialValuesStoreWithErrors = configureMockStore()(mergedStoreWithErrors)
const TemplateWithErrors: Story = (args) => {
  return (
    <Provider store={InitialValuesStoreWithErrors}>
      <InitializationManager {...args} />
    </Provider>
  )
}

export const WithErrors = TemplateWithErrors.bind({})
WithErrors.args = {}
