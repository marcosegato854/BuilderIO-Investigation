import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { IRTKServerFormProps, RTKServerForm } from './RTKServerForm'

const mockedStore = configureMockStore()(mockStore)
const defaultValues: IRTKServerFormProps = {
  connected: false,
}

export default {
  title: 'Molecules/RTKServerForm',
  component: RTKServerForm,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story = (args) => {
  return <RTKServerForm {...args} />
}

export const Default = Template.bind({})
Default.args = defaultValues

const TemplateMocked: Story = (args) => {
  return (
    <Provider store={mockedStore}>
      <RTKServerForm
        {...args}
        initialValues={mockStore.rtkService.currentServer}
      />
    </Provider>
  )
}

export const Mocked = TemplateMocked.bind({})
Mocked.args = defaultValues
