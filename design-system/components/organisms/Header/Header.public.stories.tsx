import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { SearchBar } from 'components/atoms/SearchBar/SearchBar'
import { mockStore } from 'store/mock/mockStoreTests'
import { Header, IHeaderProps } from './Header'

const InitialValuesStore = configureMockStore()(mockStore)

const defaultProps: IHeaderProps = {
  title: 'Project Browser',
  centerText: 'Job Name',
  rightComponent: <SearchBar />,
}

export default {
  title: 'Organisms/Header',
  component: Header,
  argTypes: {},
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IHeaderProps> = (args) => {
  return <Header {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps

const TemplateMockStore: Story = (args) => {
  return (
    <Provider store={InitialValuesStore}>
      <Header {...args} />
    </Provider>
  )
}

export const MockStore = TemplateMockStore.bind({})
MockStore.args = defaultProps
