import React, { FC, MouseEventHandler } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { PasswordLabel } from 'components/atoms/PasswordLabel/PasswordLabel'
import { useTranslation } from 'react-i18next'

export interface IActiveNetwork {
  networkName: string
  userName: string
  password: string
  IP: string
  qrLink: string
  onDisconnect: MouseEventHandler<HTMLButtonElement>
}

export const ActiveNetwork: FC<IActiveNetwork> = ({
  networkName,
  userName,
  password,
  IP,
  qrLink,
  onDisconnect,
}) => {
  const { t } = useTranslation()
  return (
    <Box
      sx={(theme) => ({
        flexGrow: 1,
        paddingTop: '20px',
        paddingLeft: '24px',
        paddingRight: '24px',
        paddingBottom: '20px',
        backgroundColor: theme.colors.primary_3,
        borderRadius: '10px',
      })}
    >
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={8}>
          <Typography
            variant="body1"
            sx={(theme) => ({
              color: theme.colors.secondary_8,
              display: 'flex',
              alignItems: 'center',
            })}
          >
            {networkName}
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            data-testid="disconnect-button"
            sx={(theme) => ({
              color: theme.colors.primary_11,
              paddingTop: '0.1rem',
              paddingBottom: '0.1rem',
              borderRadius: '0.8rem',
            })}
            variant="outlined"
            onClick={onDisconnect}
          >
            {t('pcu.connection.disconnectButton', 'disconnect')}
          </Button>
        </Grid>
        <Grid item xs={12}>
          <hr style={{ width: '100%' }} />
          <Typography
            variant="body2"
            sx={(theme) => ({
              marginTop: '8px',
              marginBottom: '8px',
              color: theme.colors.primary_11,
            })}
            align="center"
          >
            {t('pcu.connection.activeNetworkTitle', 'access')}
          </Typography>
        </Grid>
      </Grid>
      <Grid container alignItems="flex-start" justifyContent={'center'}>
        <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Box sx={{ ml: '68px', width: '100%' }}>
            <Typography
              variant="body1"
              gutterBottom
              sx={(theme) => ({ color: theme.colors.primary_11 })}
            >
              {t('pcu.connection.scanQrCode', 'scan')}
            </Typography>
            <Box
              component="section"
              sx={(theme) => ({
                width: '220px',
                height: '220px',
                backgroundColor: theme.colors.primary_18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '8px',
              })}
            >
              <img
                src={qrLink}
                alt="QR Code for connection"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
          </Box>
        </Grid>
        {/* <Grid item sx={{ width: '160px', minWidth: '160px' }} /> */}
        <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box sx={{ mr: '68px' }}>
            <Typography
              variant="body1"
              gutterBottom
              sx={(theme) => ({
                color: theme.colors.primary_11,
                fontWeight: 600,
              })}
            >
              {t('pcu.connection.enterCredentials', 'credentials')}
            </Typography>
            <Typography
              variant="body1"
              sx={(theme) => ({ color: theme.colors.primary_11 })}
            >
              {t('login.form.fields.username', 'username') + ':'}
            </Typography>
            <Typography
              variant="body1"
              gutterBottom
              sx={(theme) => ({ color: theme.colors.primary_11 })}
            >
              {userName}
            </Typography>
            <Typography
              variant="body1"
              sx={(theme) => ({ color: theme.colors.primary_11 })}
            >
              {t('login.form.fields.password', 'password') + ':'}
            </Typography>
            <PasswordLabel inputValue={password} />
            <Typography
              variant="body1"
              sx={(theme) => ({ color: theme.colors.primary_11 })}
            >
              {t('pcu.connection.ipLabel', 'ip')}
            </Typography>
            <Typography
              variant="body1"
              gutterBottom
              sx={(theme) => ({ color: theme.colors.primary_11 })}
            >
              {IP}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
