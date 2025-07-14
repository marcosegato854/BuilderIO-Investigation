import { Provider } from 'react-redux'
import React from 'react'
import { Story, Meta } from '@storybook/react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { mergeDeepRight } from 'ramda'
import { JobType } from 'store/features/dataStorage/types'
import NewJobForm, { INewJobFormProps } from './NewJobForm'

// 1) Declare the default value with the right type and initilize it
const initialValues: IJob = mockStore.dataStorageService.currentJob!

export default {
  title: 'Dialogs/NewJobForm',
  component: NewJobForm,
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

/** Default */
const InitialValuesStore = configureMockStore()(mockStore)
const Template: Story<INewJobFormProps> = (args) => {
  return (
    <Provider store={InitialValuesStore}>
      <NewJobForm {...args} initialValues={undefined} />
    </Provider>
  )
}
export const Default = Template.bind({})
Default.args = {}

/** Initial Values */
const TemplateInitialValues: Story<INewJobFormProps> = (args) => {
  return (
    <Provider store={InitialValuesStore}>
      <NewJobForm {...args} />
    </Provider>
  )
}
export const InitialValues = TemplateInitialValues.bind({})
InitialValues.args = {
  initialValues,
}

/** Admin User */
const AdminUserStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    authService: {
      userInfo: {
        usertype: 'service',
      },
    },
  })
)
const TemplateAdminUser: Story<INewJobFormProps> = (args) => {
  return (
    <Provider store={AdminUserStore}>
      <NewJobForm {...args} />
    </Provider>
  )
}
export const AdminUser = TemplateAdminUser.bind({})
AdminUser.args = {}

/** Optech */
const OptechStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      info: {
        sensorUnit: {
          connected: true,
        },
      },
    },
    scanner: {
      info: [
        {
          manufacturer: 'Optech',
          name: 'Scanner1',
          position: 'Right',
          model: 'CL-360HD',
          serial: '5210050',
          firmware: '1.7.0-RC7',
        },
        {
          manufacturer: 'Optech',
          name: 'Scanner2',
          position: 'Left',
          model: 'CL-360',
          serial: '5210048',
          firmware: '1.7.0+r29023',
        },
      ],
    },
  })
)
const TemplateOptech: Story<INewJobFormProps> = (args) => {
  return (
    <Provider store={OptechStore}>
      <NewJobForm {...args} />
    </Provider>
  )
}
export const Optech = TemplateOptech.bind({})
Optech.args = {}

/** ZF */
const ZFStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      info: {
        sensorUnit: {
          connected: true,
        },
      },
    },
    scanner: {
      info: [
        {
          manufacturer: 'ZF',
          name: 'Scanner1',
          position: 'Right',
          model: 'CL-360HD',
          serial: '5210050',
          firmware: '1.7.0-RC7',
        },
        {
          manufacturer: 'ZF',
          name: 'Scanner2',
          position: 'Left',
          model: 'CL-360',
          serial: '5210048',
          firmware: '1.7.0+r29023',
        },
      ],
    },
  })
)
const TemplateZF: Story<INewJobFormProps> = (args) => {
  return (
    <Provider store={ZFStore}>
      <NewJobForm {...args} />
    </Provider>
  )
}
export const ZF = TemplateZF.bind({})
ZF.args = {}

/** Velodyne */
const VelodyneStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      info: {
        sensorUnit: {
          connected: true,
        },
      },
    },
    scanner: {
      info: [
        {
          manufacturer: 'Velodyne',
          name: 'FrontSLAM',
          position: 'Front',
          model: 'VLP-16-A',
          serial: '11206202860533',
          firmware: '3.0.41.1',
        },
        {
          manufacturer: 'Velodyne',
          name: 'RearSLAM',
          position: 'Rear',
          model: 'VLP-16-A',
          serial: '11206203451120',
          firmware: '3.0.41.1',
        },
      ],
    },
  })
)
const TemplateVelodyne: Story<INewJobFormProps> = (args) => {
  return (
    <Provider store={VelodyneStore}>
      <NewJobForm {...args} />
    </Provider>
  )
}
export const Velodyne = TemplateVelodyne.bind({})
Velodyne.args = {}

/** CustomJobType */
const customProfile = mergeDeepRight(mockStore.dataStorageService.jobTypes[2], {
  name: 'CustomBoat',
  camera: {
    enable: 0,
    distance: 1.0,
  },
  position: {
    satellites: ['gps', 'glonass', 'galileo', 'qzss'],
  },
})

const jobTypes: JobType[] = [
  ...mockStore.dataStorageService.jobTypes,
  customProfile,
]
const CustomJobTypeStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      jobTypes,
    },
  })
)
const TemplateCustomJobType: Story<INewJobFormProps> = (args) => {
  return (
    <Provider store={CustomJobTypeStore}>
      <NewJobForm {...args} />
    </Provider>
  )
}
export const CustomJobType = TemplateCustomJobType.bind({})
CustomJobType.args = {}
