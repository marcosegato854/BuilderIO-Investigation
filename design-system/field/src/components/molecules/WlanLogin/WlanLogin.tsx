import React, { FC, MouseEventHandler } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Icon } from 'components/atoms/Icon/Icon'

import IconButton from '@mui/material/IconButton'
import { WifiWithIcon } from 'components/atoms/WifiWithIcon/WifiWithIcon'
import { useTranslation } from 'react-i18next'
import { WlanAccessPassword } from 'components/atoms/WlanAccessPassword/WlanAccessPassword'
import Button from '@mui/material/Button'

export interface IWlanLogin {
  onClick?: MouseEventHandler<HTMLElement>
}

export const WlanLogin: FC<IWlanLogin> = ({ onClick }) => {
  const { t } = useTranslation()
  return (
    <Box
      width="100%"
      sx={(theme) => ({
        flexGrow: 1,
        paddingRight: '32px',
        paddingLeft: '32px',
        paddingTop: '16px',
        paddingBottom: '32px',
        backgroundColor: theme.colors.primary_3,
        borderRadius: '10px',
      })}
    >
      <WlanAccessPassword />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        marginTop="24px"
      >
        <Button
          onClick={onClick}
          variant="contained"
          sx={(theme) => ({
            backgroundColor: theme.colors.primary_11,
            color: theme.colors.primary_1,
            height: '40px',
            width: '180px',
          })}
        >
          {t('rtk.server.form.connect', 'connect')}
        </Button>
      </Box>
    </Box>
  )
}
