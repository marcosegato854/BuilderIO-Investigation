import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Provider } from 'react-redux'
import { mockStore } from 'store/mock/mockStoreTests'
import configureMockStore from 'redux-mock-store'
import SatelliteView from 'assets/png/SatelliteView.png'
import NewProjectForm, { INewProjectFormProps, Unit } from './NewProjectForm'

const mockedStore = configureMockStore()(mockStore)

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
const initialValues: INewProjectFormProps['initialValues'] = {
  name: 'Pordenone003',
  disk: 'z',
  jobs: 5,
  completed: 45,
  coordinate: { unit: Unit.Metric },
  image: SatelliteView,
}

export default {
  title: 'Dialogs/NewProjectForm',
  component: NewProjectForm,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    initialValues: {
      defaultValue: initialValues,
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

/* const Template: Story<INewProjectFormProps> = (args) => {
  return <NewProjectForm {...args} />
}

export const Default = Template.bind({})
Default.args = {
  initialValues: undefined,
}

const TemplateInitialValues: Story<INewProjectFormProps> = (args) => {
  return <NewProjectForm {...args} />
} 

export const InitialValues = TemplateInitialValues.bind({})
InitialValues.args = {} */

const TemplateMockedStore: Story<INewProjectFormProps> = (args) => {
  return (
    <Provider store={mockedStore}>
      <NewProjectForm {...args} />
    </Provider>
  )
}
export const MockedStoreNew = TemplateMockedStore.bind({})
MockedStoreNew.args = { initialValues: undefined }

export const MockedStoreEdit = TemplateMockedStore.bind({
  initialValues,
})
