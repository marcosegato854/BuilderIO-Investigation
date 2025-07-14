import React, { FC, PropsWithChildren } from 'react'
import { Icon } from 'components/atoms/Icon/Icon'
import {
  HeremapsDirection,
  HeremapsActionType,
} from 'store/features/routing/types'
import useTheme from 'hooks/useTheme'

export interface IDirectionsIconProps {
  /**
   * action
   */
  action?: HeremapsActionType
  /**
   * direction
   */
  direction?: HeremapsDirection
}

/**
 * DirectionsIcon description
 */
export const DirectionsIcon: FC<IDirectionsIconProps> = ({
  action,
  direction,
}: PropsWithChildren<IDirectionsIconProps>) => {
  const [theme] = useTheme()

  const DirectionIcon = () => {
    const iconProps = {
      'data-testid': `routing-icon-${action}-${direction}`,
    }
    const isDark = theme === 'dark'
    switch (action) {
      case HeremapsActionType.TURN:
        switch (direction) {
          case HeremapsDirection.LEFT:
            return isDark ? (
              <Icon name="DarkTurnLeft" {...iconProps} />
            ) : (
              <Icon name="LightTurnLeft" {...iconProps} />
            )
          case HeremapsDirection.RIGHT:
            return isDark ? (
              <Icon name="DarkTurnRight" {...iconProps} />
            ) : (
              <Icon name="LightTurnRight" {...iconProps} />
            )
          default:
            return null
        }
      case HeremapsActionType.U_TURN:
        switch (direction) {
          case HeremapsDirection.LEFT:
            return isDark ? (
              <Icon name="DarkUTurnLeft" {...iconProps} />
            ) : (
              <Icon name="LightUTurnLeft" {...iconProps} />
            )
          case HeremapsDirection.RIGHT:
            return isDark ? (
              <Icon name="DarkUTurnRight" {...iconProps} />
            ) : (
              <Icon name="LightUTurnRight" {...iconProps} />
            )
          default:
            return null
        }
      case HeremapsActionType.KEEP:
        switch (direction) {
          case HeremapsDirection.LEFT:
            return isDark ? (
              <Icon name="DarkKeepLeft" {...iconProps} />
            ) : (
              <Icon name="LightKeepLeft" {...iconProps} />
            )
          case HeremapsDirection.RIGHT:
            return isDark ? (
              <Icon name="DarkKeepRight" {...iconProps} />
            ) : (
              <Icon name="LightKeepRight" {...iconProps} />
            )
          case HeremapsDirection.MIDDLE:
            return isDark ? (
              <Icon name="DarkKeepMiddle" {...iconProps} />
            ) : (
              <Icon name="LightKeepMiddle" {...iconProps} />
            )
          default:
            return null
        }
      case HeremapsActionType.ARRIVE:
        return isDark ? (
          <Icon name="DarkArrive" {...iconProps} />
        ) : (
          <Icon name="LightArrive" {...iconProps} />
        )
      case HeremapsActionType.CONTINUE:
        return isDark ? (
          <Icon name="DarkContinue" {...iconProps} />
        ) : (
          <Icon name="LightContinue" {...iconProps} />
        )
      case HeremapsActionType.DEPART:
        return isDark ? (
          <Icon name="DarkDepart" {...iconProps} />
        ) : (
          <Icon name="LightDepart" {...iconProps} />
        )
      case HeremapsActionType.EXIT:
        return isDark ? (
          <Icon name="DarkExit" {...iconProps} />
        ) : (
          <Icon name="LightExit" {...iconProps} />
        )
      case HeremapsActionType.RAMP:
        return isDark ? (
          <Icon name="DarkRamp" {...iconProps} />
        ) : (
          <Icon name="LightRamp" {...iconProps} />
        )
      case HeremapsActionType.ROUNDABOUT_ENTER:
        return isDark ? (
          <Icon name="DarkRoundaboutEnter" {...iconProps} />
        ) : (
          <Icon name="LightRoundaboutEnter" {...iconProps} />
        )
      case HeremapsActionType.ROUNDABOUT_EXIT:
        return isDark ? (
          <Icon name="DarkRoundaboutExit" {...iconProps} />
        ) : (
          <Icon name="LightRoundaboutExit" {...iconProps} />
        )
      default:
        return null
    }
  }

  return <DirectionIcon />
}
