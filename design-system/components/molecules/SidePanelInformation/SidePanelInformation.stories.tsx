import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  SidePanelInformation,
  ISidePanelInformationProps,
} from 'components/molecules/SidePanelInformation/SidePanelInformation'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { Provider } from 'react-redux'
import { mergeDeepRight } from 'ramda'

const customMockStore = mergeDeepRight(mockStore, {
  routingService: {
    autocaptureNeeded: mockStore.planningService.needed,
  },
})
const mockedStore = configureMockStore()(customMockStore)

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
const defaultProps: ISidePanelInformationProps = {
  jobInfo: mockStore.dataStorageService.currentJob,
}

export default {
  title: 'Molecules/SidePanelInformation',
  component: SidePanelInformation,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ISidePanelInformationProps> = (args) => {
  return <SidePanelInformation {...args} />
}
export const Default = Template.bind({})
Default.args = defaultProps

const TemplateMockStore: Story = (args) => {
  return (
    <Provider store={mockedStore}>
      <SidePanelInformation {...args} />
    </Provider>
  )
}
export const MockStore = TemplateMockStore.bind({})
MockStore.args = defaultProps

const jobCameraTime = mergeDeepRight(mockStore.dataStorageService.currentJob, {
  camera: { enable: 2 },
  snSensorUnit: 'ASDFADSFSDF-ASDFASDF-ASDF',
}) as IJob
const TemplateCameraTime: Story = (args) => {
  return (
    <Provider store={mockedStore}>
      <SidePanelInformation {...args} jobInfo={jobCameraTime} />
    </Provider>
  )
}
export const CameraTime = TemplateCameraTime.bind({})
CameraTime.args = defaultProps
