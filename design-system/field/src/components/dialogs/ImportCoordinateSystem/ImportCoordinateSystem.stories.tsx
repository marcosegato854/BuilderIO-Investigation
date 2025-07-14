import { Meta, Story } from '@storybook/react'
import ImportCoordinateSystem, {
  IImportCoordinateSystemProps,
} from 'components/dialogs/ImportCoordinateSystem/ImportCoordinateSystem'
import { mergeDeepRight } from 'ramda'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'

export default {
  title: 'Dialogs/ImportCoordinateSystem',
  component: ImportCoordinateSystem,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    // propertyA: {
    //   defaultValue: defaultProps.propertyA,
    // },
    file_type: { type: 'select', options: ['wkt', 'csys'] },
    csys_name: { defaultValue: 'Coordinate System' },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const InitialValuesStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    coordinateSystemService: {
      fileList: null,
    },
  })
)
const EmptyValuesStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    coordinateSystemService: {
      fileList: [],
    },
  })
)
const FilledValuesStore = configureMockStore()(mockStore)

/** Default */
const Template: Story<IImportCoordinateSystemProps> = (args) => {
  return (
    <Provider store={InitialValuesStore}>
      <ImportCoordinateSystem {...args} />
    </Provider>
  )
}
export const Default = Template.bind({})
Default.args = {}

/** MockStore */
const TemplateMockStore: Story<IImportCoordinateSystemProps> = (args) => {
  return (
    <Provider store={FilledValuesStore}>
      <ImportCoordinateSystem {...args} />
    </Provider>
  )
}
export const CoordinateSystemImport = TemplateMockStore.bind({})
TemplateMockStore.args = {}

/** MockStore */
const EmptyMockStore: Story<IImportCoordinateSystemProps> = (args) => {
  return (
    <Provider store={EmptyValuesStore}>
      <ImportCoordinateSystem {...args} />
    </Provider>
  )
}
export const EmptyImport = EmptyMockStore.bind({})
TemplateMockStore.args = {}
