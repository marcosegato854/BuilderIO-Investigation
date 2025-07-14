import React, { FC } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Icon } from 'components/atoms/Icon/Icon'
import IconButton from '@mui/material/IconButton'
import { PasswordLabel } from 'components/atoms/PasswordLabel/PasswordLabel'
import { useTranslation } from 'react-i18next'
import { display } from '@mui/system'

export interface IActiveLan {
  LanConnected: boolean
  userName: string
  password: string
  IP: string
}

export const ActiveLan: FC<IActiveLan> = ({
  LanConnected,
  userName,
  password,
  IP,
}) => {
  const { t } = useTranslation()
  return (
    <Box
      width="100%"
      sx={(theme) => ({
        flexGrow: 1,
        backgroundColor: theme.colors.primary_3,
        borderRadius: '10px',
        paddingTop: '20px',
        paddingLeft: '24px',
        paddingRight: '24px',
        paddingBottom: '20px',
      })}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography
          variant="body1"
          sx={(theme) => ({ color: theme.colors.primary_11 })}
        >
          {LanConnected
            ? t('pcu.connection.lanConnected', 'lan')
            : t('pcu.connection.lanNotConnected', 'nolan')}
        </Typography>
        <IconButton
          size="small"
          sx={{
            padding: 0,
            path: {
              fill: (theme) => theme.colors.primary_11,
            },
          }}
        >
          {LanConnected ? (
            <Icon data-testid="LanConnected" name="LanConnected" />
          ) : (
            <Icon data-testid="LanNotConnected" name="LanNotConnected" />
          )}
        </IconButton>
      </Box>
      {LanConnected && (
        <Box mt={1}>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: theme.colors.primary_11 })}
          >
            {t('login.form.fields.username', 'username') + ': ' + userName}
          </Typography>
          <Typography
            variant="body1"
            component="span"
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: theme.colors.primary_11,
            })}
          >
            {t('login.form.fields.password', 'password') + ': '}
            <PasswordLabel inputValue={password} />
          </Typography>

          <Typography
            variant="body1"
            sx={(theme) => ({ color: theme.colors.primary_11 })}
          >
            {t('pcu.connection.ipLabel', 'ip') + ' ' + IP}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
