import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  DirectionsIcon,
  IDirectionsIconProps,
} from 'components/atoms/DirectionsIcon/DirectionsIcon'
import { mockStore } from 'store/mock/mockStoreTests'
import {
  HeremapsActionType,
  HeremapsDirection,
} from 'store/features/routing/types'

// Example of how we should declare props' default values:

const defaultProps = mockStore.routingService.routingState!

export default {
  title: 'Atoms/DirectionsIcon',
  component: DirectionsIcon,
  argTypes: {
    direction: {
      control: {
        type: 'select',
        options: {
          Left: HeremapsDirection.LEFT,
          Right: HeremapsDirection.RIGHT,
          Middle: HeremapsDirection.MIDDLE,
        },
      },
    },
    action: {
      control: {
        type: 'select',
        options: {
          Arrive: HeremapsActionType.ARRIVE,
          Continue: HeremapsActionType.CONTINUE,
          Depart: HeremapsActionType.DEPART,
          Exit: HeremapsActionType.EXIT,
          Keep: HeremapsActionType.KEEP,
          Ramp: HeremapsActionType.RAMP,
          RoundaboutEnter: HeremapsActionType.ROUNDABOUT_ENTER,
          RoundaboutExit: HeremapsActionType.ROUNDABOUT_EXIT,
          RoundaboutPass: HeremapsActionType.ROUNDABOUT_PASS,
          Turn: HeremapsActionType.TURN,
          UTurn: HeremapsActionType.U_TURN,
        },
      },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IDirectionsIconProps> = (args) => {
  return <DirectionsIcon {...args} />
}

export const Default = Template.bind({})
Default.args = {
  direction: HeremapsDirection.LEFT,
  action: HeremapsActionType.CONTINUE,
}
