import React from 'react'
import { Story, Meta } from '@storybook/react'
import { mockStore } from 'store/mock/mockStoreTests'
import { Polygon } from 'store/features/planning/types'
import { TrackList, ITrackListProps } from './TrackList'

const defaultProps: Partial<ITrackListProps> = {
  tracks: mockStore.planningService.undoablePolygons.present,
  planningCurrentTrackID: mockStore.planningService.currentPolygonId,
  currentInternalTrackID: mockStore.planningService.currentPolygonId,
  routingCurrentTrackID: mockStore.planningService.currentPolygonId,
  active: false,
  isDragDisabled: false,
  isNameLocked: false,
  isReadOnly: false,
  /* onTrackSelection: () => {},
  onInternalTrackSelection: () => {},
  onTrackReorder: () => {},
  onInternalTrackReorder: () => {},
  onTrackChangeName: () => {},
  onInternalTrackChangeName: () => {},
  onTrackUpdateSettings: () => {},
  onInternalTrackUpdateSettings: () => {}, */
}

const validIds = mockStore.planningService.undoablePolygons.present.map(
  (track: Polygon) => track.id
)

export default {
  title: 'Molecules/TrackList',
  component: TrackList,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    planningCurrentTrackID: {
      options: validIds,
      control: { type: 'radio' },
    },
    routingCurrentTrackID: {
      options: validIds,
      control: { type: 'radio' },
    },
    currentInternalTrackID: {
      options: validIds,
      control: { type: 'radio' },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ITrackListProps> = (args) => {
  return <TrackList {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
