import { Meta, Story } from '@storybook/react'
import UpdateAvailableDialog from 'components/dialogs/UpdateAvailableDialog/UpdateAvailableDialog'
import { mergeDeepRight } from 'ramda'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value

const updateMockedStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      checkUpdate: {
        version: '1.24.1.148',
        changelog:
          'NEW FEATURES\n- INSTALLER: Updated CLM to the latest version 2.14\n- INSTALLER: PEF self-update allows user to update PEF autonomously\n- ACQUISITION:2 million points support for TRKEVO 500/700\n- PROCESSING: New processing workflow allowing the user to process multiple times\n- PROCESSING: Export multi-return values for Optech scanners\n \n \nIMPROVEMENTS\n- PLANNING: Minor bug fixing and improvements \n- PROCESSING: Anonymization improved efficiency',
        coveredByMaintenance: true,
      },
    },
  })
)

const licenseExpiredMockedStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      checkUpdate: {
        version: '1.24.1.148',
        changelog:
          'NEW FEATURES\n- INSTALLER: Updated CLM to the latest version 2.14\n- INSTALLER: PEF self-update allows user to update PEF autonomously\n- ACQUISITION:2 million points support for TRKEVO 500/700\n- PROCESSING: New processing workflow allowing the user to process multiple times\n- PROCESSING: Export multi-return values for Optech scanners\n \n \nIMPROVEMENTS\n- PLANNING: Minor bug fixing and improvements \n- PROCESSING: Anonymization improved efficiency',
        coveredByMaintenance: false,
      },
    },
  })
)

export default {
  title: 'Dialogs/UpdateAvailableDialog',
  component: UpdateAvailableDialog,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story = (args) => {
  return <UpdateAvailableDialog {...args} />
}

export const Default = Template.bind({})

const TemplateUpdateMockStore: Story = (args) => {
  return (
    <Provider store={updateMockedStore}>
      <UpdateAvailableDialog {...args} />
    </Provider>
  )
}

export const UpdateMockStore = TemplateUpdateMockStore.bind({})

const TemplateLicenseExpiredMockStore: Story = (args) => {
  return (
    <Provider store={licenseExpiredMockedStore}>
      <UpdateAvailableDialog {...args} />
    </Provider>
  )
}

export const LicenseExpiredMockStore = TemplateLicenseExpiredMockStore.bind({})
