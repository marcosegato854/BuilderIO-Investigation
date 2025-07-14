import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import useUA from 'hooks/useUA'
import { useTranslation } from 'react-i18next'
import { FC, useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { openDialogAction } from 'store/features/dialogs/slice'
import { logMessage } from 'store/features/system/slice'
import { isMobile } from 'utils/capabilities'

/**
 * CheckDevice description
 */
export const CheckDevice: FC = () => {
  const { t } = useTranslation()
  const ua = useUA()
  const dispatch = useDispatch()

  // TO AVOID EARLY RENDERING WE CHECK IF THE TRANSLATIONS ARE LOADED
  const translationsLoaded = useMemo(
    () => t('header.pegasus', 'wrong') === 'Pegasus',
    [t]
  )

  useEffect(() => {
    if (!translationsLoaded) return
    const mobile = isMobile()
    setTimeout(() => {
      dispatch(
        logMessage(
          [
            'NEW CLIENT CONNECTED',
            `mobile: ${mobile}`,
            `user agent: ${ua.ua}`,
            `browser name: ${ua.browser.name}`,
            `device type: ${ua.device.type}`,
            `os name: ${ua.os.name}`,
            `engine name: ${ua.engine.name}`,
          ].join('\n')
        )
      )
      console.info(`[CHECK DEVICE] mobile: ${mobile}`)
      console.info(`[CHECK DEVICE] user agent: ${ua.ua}`)
      console.info(`[CHECK DEVICE] browser name: ${ua.browser.name}`)
      console.info(`[CHECK DEVICE] device type: ${ua.device.type}`)
      console.info(`[CHECK DEVICE] os name: ${ua.os.name}`)
      let componentProps: IAlertProps | null = null
      const commonProps: Omit<IAlertProps, 'text'> = {
        type: 'warning',
        title: t('initialization.check_browser.title', 'check'),
        okButtonLabel: t('initialization.check_browser.ok', 'ok'),
      }
      if (mobile) {
        /** iOS */
        if (
          ua.os.name &&
          ['iOS', 'Mac OS'].includes(ua.os.name) &&
          !ua.browser.name?.includes('Safari')
        ) {
          console.info('[CHECK DEVICE] iOS Mobile detected')
          componentProps = {
            ...commonProps,
            text: t('initialization.check_browser.ios', 'not safari'),
          }
          /** Android */
        } else if (ua.os.name === 'Android' && ua.browser.name !== 'Chrome') {
          console.info('[CHECK DEVICE] Android Mobile detected')
          componentProps = {
            ...commonProps,
            text: t('initialization.check_browser.android', 'not chrome'),
          }
          /** Unknown */
        } else if (
          ua.device.type === undefined &&
          !['Chrome', 'Safari', 'Mobile Safari'].includes(ua.browser.name || '')
        ) {
          console.info('[CHECK DEVICE] unknown browser detected')
          componentProps = {
            ...commonProps,
            text: t('initialization.check_browser.unknown', 'unknown'),
          }
        } else {
          console.info('[CHECK DEVICE] mobile device - no action needed')
        }
        /** Windows */
      } else if (
        ua.os.name === 'Windows' &&
        !['Chrome', 'Edge'].includes(ua.browser.name || '')
      ) {
        console.info('[CHECK DEVICE] windows detected')
        componentProps = {
          ...commonProps,
          text: t('initialization.check_browser.windows', 'not edge'),
        }
      } else {
        console.info('[CHECK DEVICE] desktop device - no action needed')
      }
      if (componentProps) {
        dispatch(
          openDialogAction({
            component: DialogNames.Alert,
            componentProps,
          })
        )
      }
    }, 1000)
  }, [dispatch, t, translationsLoaded, ua])

  return null
}
