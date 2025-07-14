import React from 'react'
import { Story, Meta } from '@storybook/react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { Provider } from 'react-redux'
import { mergeDeepRight } from 'ramda'
import { SystemAction } from 'store/features/actions/types'
import { ActivationView, IActivationViewProps } from './ActivationView'

const defaultProps: IActivationViewProps = {
  activated: false,
}

export default {
  title: 'Organisms/ActivationView',
  component: ActivationView,
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

/** Default */
const Template: Story<IActivationViewProps> = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <ActivationView {...args} />
    </div>
  )
}
export const Default = Template.bind({})
Default.args = defaultProps

/** Undefined */
const mockedStoreUndefined = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      realTimeNotifications: [],
      systemState: {
        state: 'Activating',
      },
      info: {
        product: undefined,
      },
    },
  })
)
const TemplateUndefined: Story<IActivationViewProps> = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={mockedStoreUndefined}>
        <ActivationView {...args} />
      </Provider>
    </div>
  )
}
export const Undefined = TemplateUndefined.bind({})
Undefined.args = defaultProps

/** TRK100 */
const mockedStoreTRK100 = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      realTimeNotifications: [],
      systemState: {
        state: 'Activating',
      },
      info: {
        product: 'PEGASUS TRK100',
      },
    },
  })
)
const TemplateTRK100: Story<IActivationViewProps> = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={mockedStoreTRK100}>
        <ActivationView {...args} />
      </Provider>
    </div>
  )
}
export const TRK100 = TemplateTRK100.bind({})
TRK100.args = defaultProps

/** TRK300 */
const mockedStoreTRK300 = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      realTimeNotifications: [],
      systemState: {
        state: 'Activating',
      },
      info: {
        product: 'PEGASUS TRK300',
      },
    },
  })
)
const TemplateTRK300: Story<IActivationViewProps> = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={mockedStoreTRK300}>
        <ActivationView {...args} />
      </Provider>
    </div>
  )
}
export const TRK300 = TemplateTRK300.bind({})
TRK300.args = defaultProps

/** TRK500EVO */
const mockedStoreTRK500EVO = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      realTimeNotifications: [],
      systemState: {
        state: 'Activating',
      },
      info: {
        product: 'PEGASUS TRK500 EVO',
      },
    },
  })
)
const TemplateTRK500EVO: Story<IActivationViewProps> = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={mockedStoreTRK500EVO}>
        <ActivationView {...args} />
      </Provider>
    </div>
  )
}
export const TRK500EVO = TemplateTRK500EVO.bind({})
TRK500EVO.args = defaultProps

/** TRK500NEO */
const mockedStoreTRK500NEO = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      realTimeNotifications: [],
      systemState: {
        state: 'Activating',
      },
      info: {
        product: 'PEGASUS TRK500 NEO',
      },
    },
  })
)
const TemplateTRK500NEO: Story<IActivationViewProps> = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={mockedStoreTRK500NEO}>
        <ActivationView {...args} />
      </Provider>
    </div>
  )
}
export const TRK500NEO = TemplateTRK500NEO.bind({})
TRK500NEO.args = defaultProps

/** TRK700EVO */
const mockedStoreTRK700EVO = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      realTimeNotifications: [],
      systemState: {
        state: 'Activating',
      },
      info: {
        product: 'PEGASUS TRK700 EVO',
      },
    },
  })
)
const TemplateTRK700EVO: Story<IActivationViewProps> = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={mockedStoreTRK700EVO}>
        <ActivationView {...args} />
      </Provider>
    </div>
  )
}
export const TRK700EVO = TemplateTRK700EVO.bind({})
TRK700EVO.args = defaultProps

/** TRK700NEO */
const mockedStoreTRK700NEO = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      realTimeNotifications: [],
      systemState: {
        state: 'Activating',
      },
      info: {
        product: 'PEGASUS TRK700 NEO',
      },
    },
  })
)
const TemplateTRK700NEO: Story<IActivationViewProps> = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={mockedStoreTRK700NEO}>
        <ActivationView {...args} />
      </Provider>
    </div>
  )
}
export const TRK700NEO = TemplateTRK700NEO.bind({})
TRK700NEO.args = defaultProps

/** NO SU */
const mockedStoreNoSU = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      realTimeNotifications: [],
      systemState: {
        state: 'Activating',
      },
      info: {
        product: 'Sensor unit unconnected',
      },
    },
  })
)
const TemplateNoSU: Story<IActivationViewProps> = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={mockedStoreNoSU}>
        <ActivationView {...args} />
      </Provider>
    </div>
  )
}
export const NoSU = TemplateNoSU.bind({})
NoSU.args = defaultProps

/** AtStart */
const mockedStoreAtStart = configureMockStore()(
  mergeDeepRight(mockStore, {
    system: {
      realTimeNotifications: [],
      systemState: null,
      info: null,
    },
  })
)
const TemplateAtStart: Story<IActivationViewProps> = (args) => {
  return (
    <div style={{ height: '90vh' }}>
      <Provider store={mockedStoreAtStart}>
        <ActivationView {...args} />
      </Provider>
    </div>
  )
}
export const AtStart = TemplateAtStart.bind({})
AtStart.args = defaultProps
