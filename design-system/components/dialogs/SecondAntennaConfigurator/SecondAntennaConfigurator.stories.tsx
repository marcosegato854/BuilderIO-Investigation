import React from 'react'
import { Story, Meta } from '@storybook/react'
import SecondAntennaConfigurator, {
  ISecondAntennaConfiguratorProps,
} from 'components/dialogs/SecondAntennaConfigurator/SecondAntennaConfigurator'
import configureMockStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { mockStore } from 'store/mock/mockStoreTests'
import { mergeDeepRight } from 'ramda'
import { ErrorManager } from 'components/organisms/ErrorManager/ErrorManager'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
// const defaultProps: ISecondAntennaConfiguratorProps = {
//   propertyA: 'hello',
//   propertyB: true,
// }

export default {
  title: 'Dialogs/SecondAntennaConfigurator',
  component: SecondAntennaConfigurator,
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

/* DEFAULT */
const DefaultStore = configureMockStore()(mergeDeepRight(mockStore, {}))
const Template: Story<ISecondAntennaConfiguratorProps> = (args) => {
  return (
    <Provider store={DefaultStore}>
      <SecondAntennaConfigurator {...args} />
    </Provider>
  )
}
export const Default = Template.bind({})
Default.args = {}

/* Imperial */
const ImperialStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      currentProject: {
        coordinate: {
          unit: 'imperial',
        },
      },
    },
  })
)
const TemplateImperial: Story<ISecondAntennaConfiguratorProps> = (args) => {
  return (
    <Provider store={ImperialStore}>
      <ErrorManager />
      <SecondAntennaConfigurator {...args} />
    </Provider>
  )
}
export const Imperial = TemplateImperial.bind({})
Imperial.args = {}

/* Saved Values Imperial */
const SavedValuesStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      currentProject: {
        coordinate: {
          unit: 'imperial',
        },
      },
    },
    cameraService: {
      antenna2: {
        pixel: {
          x: 0,
          y: 0,
        },
        distance: 0,
        leverarm: {
          x: 2,
          y: 3,
          z: 4,
        },
      },
    },
  })
)
const TemplateSavedValues: Story<ISecondAntennaConfiguratorProps> = (args) => {
  return (
    <Provider store={SavedValuesStore}>
      <ErrorManager />
      <SecondAntennaConfigurator {...args} />
    </Provider>
  )
}
export const SavedValues = TemplateSavedValues.bind({})
SavedValues.args = {}

/* ADMIN */
const AdminStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    authService: {
      isAuthenticating: false,
      userInfo: {
        usertype: 'service',
      },
    },
  })
)
const TemplateAdmin: Story<ISecondAntennaConfiguratorProps> = (args) => {
  return (
    <Provider store={AdminStore}>
      <SecondAntennaConfigurator {...args} />
    </Provider>
  )
}

export const Admin = TemplateAdmin.bind({})
Admin.args = {}
