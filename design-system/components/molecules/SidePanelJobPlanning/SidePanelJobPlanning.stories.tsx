import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { SidePanelJobPlanning } from './SidePanelJobPlanning'
import { mergeDeepRight } from 'ramda'
import { mockTrackGeometry } from 'store/mock/mockTrackGeometry'
import { mockPolygonGeometry } from 'store/mock/mockPolygonGeometry'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
// const defaultProps: ISidePanelJobPlanningProps = {
//   propertyA: 'hello',
//   propertyB: true,
// }

const mockedStore = configureMockStore()(
  mergeDeepRight(mockStore, {
    planningService: {
      undoablePolygons: {
        present: [
          {
            name: 'Track001',
            isPolygon: false,
            color: '#7178fc',
            id: 10,
            ...mockTrackGeometry,
          },
          {
            name: 'Shape file with long name, incredibly long',
            isPolygon: true,
            color: '#37e5b4',
            ...mockPolygonGeometry,
            id: 12,
          },
        ],
      },
    },
  })
)

export default {
  title: 'Molecules/SidePanelJobPlanning',
  component: SidePanelJobPlanning,
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

const Template: Story = (args) => {
  return <SidePanelJobPlanning {...args} />
}

export const Default = Template.bind({})
Default.args = {}

const TemplateMockStore: Story = (args) => {
  return (
    <Provider store={mockedStore}>
      <SidePanelJobPlanning {...args} />
    </Provider>
  )
}

export const MockStore = TemplateMockStore.bind({})
MockStore.args = {}
