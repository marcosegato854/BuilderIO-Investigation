import { Portal, useMediaQuery } from '@mui/material'
import { BrokenView } from 'components/atoms/BrokenView/BrokenView'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * PortraitOverlay description
 */
export const PortraitOverlay: FC = () => {
  const { t } = useTranslation()
  const isLandscape = useMediaQuery('(orientation: landscape)')
  const bypassOverlay = process.env.NX_BYPASS_MOBILE_CHECK

  /**
   * Covers portrait and landscape view.
   * Arbitrary resolution of 900x414
   */
  const isMobile = useMediaQuery(
    '(max-width:900px) and (max-height:414px), (max-width:414px) and (max-height:900px)'
  )

  const textMessage = useMemo(() => {
    if (isMobile)
      return t('portraitOverlay.mobile', 'Mobile phones not supported')
    return t('portraitOverlay.rotate', 'Please rotate the device')
  }, [isMobile, t])

  if (bypassOverlay) return null
  if (isLandscape && !isMobile) return null

  return (
    <Portal>
      <BrokenView message={textMessage} />
    </Portal>
  )
}
