import { Meta, Story } from '@storybook/react'
import { mergeDeepRight } from 'ramda'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { FirmwareUpdate, IFirmwareUpdateProps } from './FirmwareUpdate'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
// const defaultOptions: Array<IClickableOption> = [
//   {
//     value: 'edit',
//     label: 'Edit Project',
//   }
// ]
// const defaultProps: IFirmwareUpdateProps = {
//   ccp: '123456789654',
//   expireDate: '01/01/2023',
//   updateDate: '28/07/2021',
//   firmwareVersion: '0.01',
//   updateAvailableVersion: '0.0.0.0',
//   isUSBDetected: true,
//   isUpdateAvailable: true,
//   prerequisitesStatus: {
//     status: 'progress',
//     title: '50% checking prerequisites',
//     errors: [],
//   },
//   updateNews: ['minor fixies', 'support for tablets', 'another fancy line'],
// }

const mockedStore = configureMockStore()(mockStore)
const updateMockedStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      updateInfo: {
        usbConnected: true,
        version: '0.0.0.0',
        changelog:
          'NEW FEATURES\n- INSTALLER: Updated CLM to the latest version 2.14\n- INSTALLER: PEF self-update allows user to update PEF autonomously\n- ACQUISITION:2 million points support for TRKEVO 500/700\n- PROCESSING: New processing workflow allowing the user to process multiple times\n- PROCESSING: Export multi-return values for Optech scanners\n \n \nIMPROVEMENTS\n- PLANNING: Minor bug fixing and improvements \n- PROCESSING: Anonymization improved efficiency',
        lastVersion: '2024.1.1.98',
        lastDate: 'yyyy-MM-ddTHH:mm:ssTZD',
        eula: 'eula',
      },
    },
  })
)
const systemErrorMockedStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      updateInfo: {
        version: '0.0.0.0',
      },
      updatePrepareStatus: {
        status: 'error',
        description: 'error',
        errors: [
          { code: 'UPD-101', description: 'UPD-101' },
          { code: 'UPD-101', description: 'UPD-101' },
          { code: 'UPD-102', description: 'UPD-102' },
        ],
      },
    },
  })
)

const softwareErrorMockedStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      updateInfo: {
        version: '0.0.0.0',
      },
      updatePrepareStatus: {
        status: 'error',
        description: 'error',
        errors: [
          { code: 'UPD-205', description: 'UPD-205' },
          { code: 'UPD-206', description: 'UPD-206' },
        ],
      },
    },
  })
)

export default {
  title: 'Molecules/FirmwareUpdate',
  component: FirmwareUpdate,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IFirmwareUpdateProps> = (args) => {
  return <FirmwareUpdate {...args} />
}

export const Default = Template.bind({})

const TemplateMockStore: Story = (args) => {
  return (
    <Provider store={mockedStore}>
      <FirmwareUpdate {...args} />
    </Provider>
  )
}

export const MockStore = TemplateMockStore.bind({})
// Default.args = defaultProps

const TemplateUpdate: Story = (args) => {
  return (
    <Provider store={updateMockedStore}>
      <FirmwareUpdate {...args} />
    </Provider>
  )
}

export const Update = TemplateUpdate.bind({})
// Default.args = defaultProps

const TemplateSystemError: Story = (args) => {
  return (
    <Provider store={systemErrorMockedStore}>
      <FirmwareUpdate {...args} />
    </Provider>
  )
}

export const SystemError = TemplateSystemError.bind({})

const TemplateSoftwareError: Story = (args) => {
  return (
    <Provider store={softwareErrorMockedStore}>
      <FirmwareUpdate {...args} />
    </Provider>
  )
}

export const SoftwareError = TemplateSoftwareError.bind({})
