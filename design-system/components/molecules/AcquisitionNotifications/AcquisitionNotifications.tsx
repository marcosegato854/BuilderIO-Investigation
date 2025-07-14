import { Dialog, Zoom } from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'
import classNames from 'classnames'
import { StatusBarNotification } from 'components/atoms/StatusBarNotification/StatusBarNotification'
import AcquisitionDialog from 'components/dialogs/AcquisitionDialog/AcquisitionDialog'
import style from 'components/molecules/AcquisitionNotifications/AcquisitionNotifications.module.scss'
import useUA from 'hooks/useUA'
import { prop, uniqBy } from 'ramda'
import React, { FC, Suspense, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  cameraDisconnectionNotifications,
  dataStorageNotifications,
  scannerTemperatureNotifications,
  SocketNotificationCodes,
} from 'store/features/system/notifications/notificationCodes'
import {
  notificationPositionAction,
  selectRealTimeErrors,
} from 'store/features/system/slice'
import {
  NotificationsPosition,
  SystemNotification,
  SystemNotificationType,
} from 'store/features/system/types'
// import Swiper core and required modules
import SwiperCore, { Autoplay } from 'swiper/core'
import { Swiper, SwiperSlide } from 'swiper/react'
import { getKey } from 'utils/notifications'
import { enumValues } from 'utils/objects'

const socketNotificationCodes = enumValues(SocketNotificationCodes)
// https://swiperjs.com/demos#vertical
// https://swiperjs.com/react

// install Swiper modules
SwiperCore.use([Autoplay])

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>
) {
  return <Zoom ref={ref} {...props} />
})

/**
 * AcquisitionNotifications description
 */
export const AcquisitionNotifications: FC = () => {
  const errors = useSelector(selectRealTimeErrors)
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [slideIndex, setSlideIndex] = useState<number>(0)
  const ua = useUA()

  const isIPad = useMemo(
    () => ua.device.type === 'tablet' && ua.os.name === 'iOS',
    [ua]
  )

  const slideHeight = useMemo(() => (isIPad ? 42 : 32), [isIPad])

  const centerErrors = useMemo(
    () =>
      uniqBy(
        prop('key'),
        errors
          .filter((e) => {
            if (
              socketNotificationCodes.includes(e.code) ||
              cameraDisconnectionNotifications.includes(e.code) ||
              dataStorageNotifications.includes(e.code) ||
              scannerTemperatureNotifications.includes(e.code) ||
              e.type !== SystemNotificationType.ERROR ||
              e.displayAt === NotificationsPosition.BOTTOM
            )
              return false
            return true
          })
          .map((n, i) => ({ ...n, key: getKey(n, i) }))
      ),
    [errors]
  )

  const bottomErrors = useMemo(
    () =>
      uniqBy(
        prop('key'),
        errors
          .filter((e) => {
            if (socketNotificationCodes.includes(e.code)) return false
            if (cameraDisconnectionNotifications.includes(e.code)) return true
            if (e.type === SystemNotificationType.WARNING) return true
            if (
              e.type === SystemNotificationType.ERROR &&
              e.displayAt === NotificationsPosition.BOTTOM
            )
              return true
            /* show the specific error on the temperature */
            if (e.code === 'SCN-070') return true
            return false
          })
          .map((n, i) => ({ ...n, key: getKey(n, i) }))
      ),
    [errors]
  )

  const severity = useMemo(() => {
    if (bottomErrors && bottomErrors[slideIndex])
      return bottomErrors[slideIndex].type
    return ''
  }, [slideIndex, bottomErrors])

  const putNotificationsOnBottom = (notification: SystemNotification) => {
    dispatch(
      notificationPositionAction({
        notification,
        position: NotificationsPosition.BOTTOM,
      })
    )
  }

  return (
    <>
      {bottomErrors && bottomErrors.length > 0 && (
        <div
          className={classNames({
            [style.severity]: true,
            [style.iPad]: isIPad,
            [style[`severity-${severity}`]]: true,
          })}
          data-testid="bottom-notifications"
        >
          <div className={style.outerSwiper}>
            <Swiper
              direction="vertical"
              slidesPerView={1}
              height={slideHeight}
              loop={true}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              onSlideChange={(e) => setSlideIndex(e.realIndex)}
            >
              {bottomErrors.map((error, i) => {
                return (
                  <SwiperSlide key={`bottom-${error.key}`}>
                    <StatusBarNotification
                      // severity={error.type}
                      message={t(
                        `notifications.${error.code}`,
                        error.description
                      )}
                    />
                  </SwiperSlide>
                )
              })}
            </Swiper>
          </div>
        </div>
      )}
      {centerErrors &&
        centerErrors.map((error, i) => {
          const indent = 10 * i
          return (
            <Dialog
              key={`center-${error.key}`}
              open
              TransitionComponent={Transition}
              maxWidth={false}
              scroll="body"
              data-testid="center-slide"
              sx={{
                zIndex: 1602,
                transform: `translate(${indent}px,${indent}px)`,
                /* '&.MuiModal-root': {
                  pointerEvents: 'none',
                }, */
              }}
            >
              <div data-test="dialog-component">
                <Suspense fallback="">
                  <AcquisitionDialog
                    type={error.type}
                    text={t(`notifications.${error.code}`, error.description)}
                    okButtonLabel={t('acquisition.dialogs.ok', 'ok')}
                    okButtonCallback={() => putNotificationsOnBottom(error)}
                  />
                </Suspense>
              </div>
            </Dialog>
          )
        })}
    </>
  )
}
