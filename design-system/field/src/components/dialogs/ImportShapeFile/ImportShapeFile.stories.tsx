import React from 'react'
import { Story, Meta } from '@storybook/react'
import ImportShapeFile, {
  IImportShapeFileProps,
} from 'components/dialogs/ImportShapeFile/ImportShapeFile'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
// const defaultProps: IImportShapeFileProps = {
//   propertyA: 'hello',
//   propertyB: true,
// }

export default {
  title: 'Dialogs/ImportShapeFile',
  component: ImportShapeFile,
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

/** Default */
const Template: Story<IImportShapeFileProps> = (args) => {
  return <ImportShapeFile {...args} />
}
export const Default = Template.bind({})
Default.args = {}

/** MockStore */
const InitialValuesStore = configureMockStore()(mockStore)
const TemplateMockStore: Story<IImportShapeFileProps> = (args) => {
  return (
    <Provider store={InitialValuesStore}>
      <ImportShapeFile {...args} />
    </Provider>
  )
}
export const FilledMockStore = TemplateMockStore.bind({})
TemplateMockStore.args = {}
