import { Meta, Story } from '@storybook/react'
import JobInfo, { IJobInfoProps } from 'components/dialogs/JobInfo/JobInfo'
import { mergeDeepRight } from 'ramda'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { OptimizedRootState } from 'store/features/dataStorage/slice'
import { mockStore } from 'store/mock/mockStoreTests'

const mockStoreWithNtip = mergeDeepRight(mockStore, {
  dataStorageService: {
    currentJob: {
      ntrip: {
        enable: true,
        interfacemode: 'INTMODE',
        mountpoint: 'MOUNTP',
        name: 'Test Server',
        password: 'mypassword',
        server: '127.0.0.1:8000',
        user: 'username',
      },
      camera: {
        enable: 2,
      },
    },
  },
}) as OptimizedRootState

// 1) Declare the default value with the right type and initilize it
const initialValues: IJob = mergeDeepRight(
  mockStore.dataStorageService.currentJob!,
  { camera: { enable: 2 } }
) as IJob

export default {
  title: 'Dialogs/JobInfo',
  component: JobInfo,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    // options: {
    //   defaultValue: defaultOptions,
    // },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

/** NO VALUES */
const Template: Story<IJobInfoProps> = (args) => {
  return <JobInfo {...args} />
}
export const NoValues = Template.bind({})
NoValues.args = {}

/** WITH VALUES */
export const WithValues = Template.bind({})
WithValues.args = {
  initialValues,
  disableEdit: false,
}

/** STORE VALUES */
const InitialValuesStore = configureMockStore()(mockStoreWithNtip)
const TemplateStoreValues: Story<IJobInfoProps> = (args) => {
  return (
    <Provider store={InitialValuesStore}>
      <JobInfo {...args} />
    </Provider>
  )
}
export const StoreValues = TemplateStoreValues.bind({})
StoreValues.args = {}

/** CAMERA OFF */
const mockStoreWithCameraOff = mergeDeepRight(mockStore, {
  router: {
    location: {
      pathname: '/acquisition/p/Project002/Job001',
    },
  },
  dataStorageService: {
    currentJob: {
      camera: {
        enable: 0,
      },
      snSensorUnit: 'ASDFASDF-aSDFASDFA-ASDFASDF',
    },
  },
})
const InitialValuesCameraOff = configureMockStore()(mockStoreWithCameraOff)
const TemplateCameraOff: Story<IJobInfoProps> = (args) => {
  return (
    <Provider store={InitialValuesCameraOff}>
      <JobInfo {...args} />
    </Provider>
  )
}
export const CameraOff = TemplateCameraOff.bind({})
CameraOff.args = {}

/** 2ND ANTENNA DOUBLE */
const mockStoreWith2ndAntenna = mergeDeepRight(mockStore, {
  router: {
    location: {
      pathname: '/acquisition/p/Project002/Job001',
    },
  },
  dataStorageService: {
    currentJob: {
      antenna: {
        type: 'double',
      },
    },
  },
})
const InitialValues2ndAntenna = configureMockStore()(mockStoreWith2ndAntenna)
const TemplateStore2AntennaDouble: Story<IJobInfoProps> = (args) => {
  return (
    <Provider store={InitialValues2ndAntenna}>
      <JobInfo {...args} />
    </Provider>
  )
}
export const Store2AntennaDouble = TemplateStore2AntennaDouble.bind({})
Store2AntennaDouble.args = {}
