import React from 'react'
import { Story, Meta } from '@storybook/react'
import { ViewMode } from 'store/features/position/types'
import { SidePanelSettings, ISidePanelSettingsProps } from './SidePanelSettings'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { mergeDeepRight } from 'ramda'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
const defaultProps: ISidePanelSettingsProps = {
  viewMode: ViewMode.MAP,
}

export default {
  title: 'Molecules/SidePanelSettings',
  component: SidePanelSettings,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    viewMode: {
      control: {
        type: 'radio',
        options: Object.values(ViewMode),
      },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

/** Default */
const Template: Story<ISidePanelSettingsProps> = (args) => {
  return <SidePanelSettings {...args} />
}
export const Default = Template.bind({})
Default.args = defaultProps

/** WithPlan */
const InitialValuesWithPlan = configureMockStore()(mockStore)
const TemplateWithPlan: Story<ISidePanelSettingsProps> = (args) => {
  return (
    <Provider store={InitialValuesWithPlan}>
      <SidePanelSettings {...args} />
    </Provider>
  )
}
export const WithPlan = TemplateWithPlan.bind({})
WithPlan.args = defaultProps

/** HiddenTracks */
const InitialValuesHiddenTracks = configureMockStore()(
  mergeDeepRight(mockStore, {
    positionService: {
      planTracksVisible: false,
    },
    routingService: {
      autocaptureStatus: {
        enabled: false,
      },
    },
  })
)
const TemplateHiddenTracks: Story<ISidePanelSettingsProps> = (args) => {
  return (
    <Provider store={InitialValuesHiddenTracks}>
      <SidePanelSettings {...args} />
    </Provider>
  )
}
export const HiddenTracks = TemplateHiddenTracks.bind({})
HiddenTracks.args = defaultProps
