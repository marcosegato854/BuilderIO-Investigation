import { Portal } from '@mui/material'
import { BrokenView } from 'components/atoms/BrokenView/BrokenView'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useNetworkStatus } from 'use-network-status'

/**
 * OfflineOverlay description
 */
export const OfflineOverlay: FC = () => {
  const { t } = useTranslation()
  const isOnline = useNetworkStatus()
  if (isOnline) return null
  return (
    <Portal>
      <BrokenView message={t('offline.message', 'You are offline')} />
    </Portal>
  )
}
