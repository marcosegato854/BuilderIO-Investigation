/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Grid, Tab, Tabs } from '@mui/material'
import { Icon } from 'components/atoms/Icon/Icon'
import classNames from 'classnames'
import { ScrollableOnLeft } from 'components/atoms/ScrollableOnLeft/ScrollableOnLeft'
import { TabPanel } from 'components/atoms/TabPanel/TabPanel'
import style from 'components/molecules/SidePanelNotifications/SidePanelNotifications.module.scss'
import { MyVRProvider } from 'hooks/useMyVRProvider'
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  mapNavigationModeAction,
  mapPanningModeAction,
} from 'store/features/position/slice'
import {
  MapNavigationMode,
  MapPanningMode,
} from 'store/features/position/types'
import { selectSystemNotifications } from 'store/features/system/slice'
import {
  SystemNotification,
  SystemNotificationType,
} from 'store/features/system/types'
import { setPosition } from 'utils/myVR/common/position'
import { Position } from 'utils/myVR/types'

const changeTab = (index: number) => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  }
}
export interface ISidePanelNotificationsProps {
  /**
   * myVR provider instance
   */
  myVRProvider?: MyVRProvider
}

/**
 * SidePanelNotifications description
 */
export const SidePanelNotifications: FC<ISidePanelNotificationsProps> = ({
  myVRProvider,
}: PropsWithChildren<ISidePanelNotificationsProps>) => {
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)
  const dispatch = useDispatch()
  const notifications = useSelector(selectSystemNotifications)

  const changeTabHandler = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  const notificationClickHandle = useCallback(
    (notification: SystemNotification) => {
      if (notification.mapPosition?.latitude && myVRProvider) {
        const position: Position = {
          latitude: notification.mapPosition.latitude,
          longitude: notification.mapPosition.longitude,
        }
        myVRProvider.execute(setPosition(position)(200))
        dispatch(mapPanningModeAction(MapPanningMode.FREE))
        dispatch(mapNavigationModeAction(MapNavigationMode.NONE))
      }
    },
    [dispatch, myVRProvider]
  )

  const orderednotification = useMemo(() => {
    if (!notifications) return []
    return [...notifications].reverse()
  }, [notifications])

  return (
    <Grid item container className={style.content}>
      <Grid container marginBottom={2}>
        <Tabs value={tab} onChange={changeTabHandler} aria-label="help tabs">
          <Tab
            label={t('side_panel.notifications.title', 'Errors & warnings')}
            {...changeTab(0)}
          />
        </Tabs>
      </Grid>
      <TabPanel value={tab} index={0} padding={0} cssClass={style.tabPanel}>
        <ScrollableOnLeft>
          <ul className={style.list}>
            {/* TODO remove index and use the timestamp */}
            {orderednotification?.map((notification, index) => (
              // <Tooltip
              //   title={notification.description}
              //   key={`notification-${index}`}
              //   placement="top"
              //   TransitionComponent={Fade}
              // >
              <li
                className={classNames({
                  [style.item]: true,
                  [style.itemClickable]: notification.mapPosition,
                })}
                data-testid="system-notification"
                onClick={() => notificationClickHandle(notification)}
                key={`notification-${index}`}
              >
                <span className={style.dotIcon} />
                <p className={style.description}>
                  {notification.description || notification.code}
                </p>
                {/* TODO: temporary, remove code when the empty notifications bug is solved */}
                {notification.type === SystemNotificationType.ERROR ? (
                  <Icon
                    name="Error"
                    className={classNames({
                      [style.icon]: true,
                      [style.iconError]: true,
                    })}
                  />
                ) : (
                  <Icon
                    name="Warning2"
                    className={classNames({
                      [style.icon]: true,
                      [style.iconWarning]: true,
                    })}
                  />
                )}
              </li>
              // </Tooltip>
            ))}
          </ul>
        </ScrollableOnLeft>
      </TabPanel>
    </Grid>
  )
}
