import React from 'react'
import { Story, Meta } from '@storybook/react'
import configureMockStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { ViewMode } from 'store/features/position/types'
import { mockStore } from 'store/mock/mockStoreTests'
import { MemoryRouter } from 'react-router-dom'
import { NotificationsPosition } from 'store/features/system/types'
import { AcquisitionView } from 'components/organisms/AcquisitionView/AcquisitionView'
import { mergeDeepRight } from 'ramda'

const InitialValuesStore = configureMockStore()(mockStore)

const InitialValuesStoreBottom = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      position: 'bottom' as NotificationsPosition,
    },
  })
)

const overridePosition = {
  positionService: {
    viewMode: 'CAMERA' as ViewMode,
  },
}

const InitialValuesStoreCamera = configureMockStore()(
  mergeDeepRight(mockStore, {
    overridePosition,
  })
)

const InitialValuesStoreLiveCamera = configureMockStore()(
  mergeDeepRight(mockStore, {
    overridePosition,
    system: {
      realTimeNotifications: [],
    },
  })
)

const InitialValuesStoreNoCamera = configureMockStore()(
  mergeDeepRight(mockStore, {
    overridePosition,
    system: {
      position: 'bottom' as NotificationsPosition,
    },
    cameraService: {
      trigger: {
        type: 'None',
      },
    },
    routingService: {
      autocaptureCurrentPolygon: {
        paths: [
          {
            settings: {
              camera: {
                enable: false,
              },
            },
          },
        ],
      },
    },
  })
)

const InitialValuesStoreNoCameraRecording = configureMockStore()(
  mergeDeepRight(mockStore, {
    overridePosition,
    system: {
      position: 'bottom' as NotificationsPosition,
      systemState: {
        state: 'Recording',
      },
    },
    cameraService: {
      trigger: {
        type: 'None',
      },
    },
    routingService: {
      autocaptureCurrentPolygon: {
        paths: [
          {
            settings: {
              camera: {
                enable: false,
              },
            },
          },
        ],
      },
    },
  })
)

const InitialValuesStoreStartingRecording = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      position: 'bottom' as NotificationsPosition,
      realTimeNotifications: [],
      systemState: {
        state: 'StartingRecording',
      },
    },
    positionService: {
      viewMode: ViewMode.MAP,
      positionState: {
        accuracy: {
          latitude: 2.3203141689300539,
          longitude: 2.503906726837158,
          height: 2.831125020980835,
          value: 4.499938063114486,
          class: 0,
        },
      },
    },
  })
)

export default {
  title: 'Organisms/AcquisitionView',
  component: AcquisitionView,
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

const Template: Story = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <MemoryRouter initialEntries={['/']}>
        <AcquisitionView {...args} />
      </MemoryRouter>
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {}

const TemplateMockStore: Story = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={InitialValuesStore}>
        <MemoryRouter initialEntries={['/']}>
          <AcquisitionView {...args} />
        </MemoryRouter>
      </Provider>
    </div>
  )
}

export const MockStore = TemplateMockStore.bind({})
MockStore.args = {}

const TemplateMockStoreBottom: Story = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={InitialValuesStoreBottom}>
        <MemoryRouter initialEntries={['/']}>
          <AcquisitionView {...args} />
        </MemoryRouter>
      </Provider>
    </div>
  )
}

export const MockStoreBottom = TemplateMockStoreBottom.bind({})
MockStoreBottom.args = {}

const TemplateMockStoreCamera: Story = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={InitialValuesStoreCamera}>
        <MemoryRouter initialEntries={['/']}>
          <AcquisitionView {...args} />
        </MemoryRouter>
      </Provider>
    </div>
  )
}

export const MockStoreCamera = TemplateMockStoreCamera.bind({})
MockStoreCamera.args = {}

const TemplateMockStoreLiveCamera: Story = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={InitialValuesStoreLiveCamera}>
        <MemoryRouter initialEntries={['/']}>
          <AcquisitionView {...args} />
        </MemoryRouter>
      </Provider>
    </div>
  )
}

export const MockStoreLiveCamera = TemplateMockStoreLiveCamera.bind({})
MockStoreLiveCamera.args = {}

const TemplateMockStoreNoCamera: Story = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={InitialValuesStoreNoCamera}>
        <MemoryRouter initialEntries={['/']}>
          <AcquisitionView {...args} />
        </MemoryRouter>
      </Provider>
    </div>
  )
}

export const MockStoreNoCamera = TemplateMockStoreNoCamera.bind({})
MockStoreCamera.args = {}

const TemplateMockStoreNoCameraRecording: Story = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={InitialValuesStoreNoCameraRecording}>
        <MemoryRouter initialEntries={['/']}>
          <AcquisitionView {...args} />
        </MemoryRouter>
      </Provider>
    </div>
  )
}

export const MockStoreNoCameraRecording =
  TemplateMockStoreNoCameraRecording.bind({})
MockStoreCamera.args = {}

const TemplateMockStoreStartingRecording: Story = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={InitialValuesStoreStartingRecording}>
        <MemoryRouter initialEntries={['/']}>
          <AcquisitionView {...args} />
        </MemoryRouter>
      </Provider>
    </div>
  )
}

export const MockStoreStartingRecording =
  TemplateMockStoreStartingRecording.bind({})
MockStoreCamera.args = {}
