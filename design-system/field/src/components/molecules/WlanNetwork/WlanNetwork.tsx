import React, { FC, MouseEventHandler } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Icon } from 'components/atoms/Icon/Icon'

import IconButton from '@mui/material/IconButton'
import { WifiWithIcon } from 'components/atoms/WifiWithIcon/WifiWithIcon'
import { useTranslation } from 'react-i18next'

export interface IWlanNetwork {
  WLANsAvailable: number
  WifiText: string
  onClick?: MouseEventHandler<HTMLElement>
}

export const WlanNetwork: FC<IWlanNetwork> = ({
  WLANsAvailable,
  WifiText,
  onClick,
}) => {
  const { t } = useTranslation()
  return (
    <Box>
      <Box
        width="100%"
        sx={(theme) => ({
          flexGrow: 1,
          paddingTop: '8px',
          paddingBottom: '8px',
          backgroundColor: theme.colors.primary_3,
          borderRadius: '10px',
        })}
      >
        {WLANsAvailable <= 0 ? (
          <Typography
            variant="body2"
            sx={(theme) => ({ color: theme.colors.primary_11 })}
          >
            {t('pcu.connection.noNetworkAvailable', 'noNetwork')}
          </Typography>
        ) : (
          Array.from({ length: WLANsAvailable }).map((_, index) => (
            <WifiWithIcon onClick={onClick} Text={WifiText} key={index} />
          ))
        )}
      </Box>
    </Box>
  )
}
