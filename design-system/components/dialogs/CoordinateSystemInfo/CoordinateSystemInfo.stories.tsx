import React from 'react'
import { Story, Meta } from '@storybook/react'
import CoordinateSystemInfo, {
  ICoordinateSystemInfoProps,
} from 'components/dialogs/CoordinateSystemInfo/CoordinateSystemInfo'
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
  title: 'Dialogs/CoordinateSystemInfo',
  component: CoordinateSystemInfo,
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
const Template: Story<ICoordinateSystemInfoProps> = (args) => {
  return <CoordinateSystemInfo {...args} />
}
export const Default = Template.bind({})
Default.args = {}

/** MockStore */
const InitialValuesStore = configureMockStore()(mockStore)
const TemplateMockStore: Story<ICoordinateSystemInfoProps> = (args) => {
  return (
    <Provider store={InitialValuesStore}>
      <CoordinateSystemInfo {...args} />
    </Provider>
  )
}
export const FilledMockStore = TemplateMockStore.bind({})
TemplateMockStore.args = {}
