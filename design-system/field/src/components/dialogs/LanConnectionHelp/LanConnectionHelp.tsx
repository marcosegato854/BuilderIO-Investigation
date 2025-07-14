/* eslint-disable react/no-danger */
import classNames from 'classnames'
import { CloseButton } from 'components/atoms/CloseButton/CloseButton'
import React, { FC, PropsWithChildren } from 'react'
import style from './LanConnectionHelp.module.scss'
import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'

export interface ILanConnectionHelpProps {
  onClose?: React.MouseEventHandler<SVGSVGElement>
}

/**
 * LanConnectionHelp description
 */
const LanConnectionHelp: FC<ILanConnectionHelpProps> = ({
  onClose,
}: PropsWithChildren<ILanConnectionHelpProps>) => {
  const { t } = useTranslation()

  return (
    <Box
      data-testid="contextual-help-dialog"
      p={'16px'}
      sx={(theme) => ({
        width: '720px',
        height: '360px',
        borderRadius: '8px',
        bgcolor: theme.colors.primary_22,
        flexGrow: 1,
      })}
      overflow={'auto'}
    >
      <Grid
        pt={'20px'}
        pb={'20px'}
        pr={'16px'}
        pl={'16px'}
        container
        spacing={2}
      >
        <Grid xs={10}>
          <Typography
            data-testid="section-help-title"
            variant="body1"
            sx={(theme) => ({ color: theme.colors.primary_11 })}
          >
            {t('pcu.connection.help.title', 'connect')}
          </Typography>
        </Grid>
        <Grid justifyItems={'flex-end'} alignContent={'center'} xs={2}>
          <CloseButton data-testid="close-button" onClick={onClose!} />
        </Grid>
        <Grid xs={12}>
          <Typography
            data-testid="whole-text"
            variant="body1"
            sx={(theme) => ({ color: theme.colors.primary_11 })}
          >
            <Typography
              data-testid="section-title-wlan"
              variant="body1"
              sx={(theme) => ({ color: theme.colors.primary_11 })}
            >
              {t('pcu.connection.help.wlan', 'wlan')}
            </Typography>
            <List sx={{ listStyle: 'decimal', pl: 4 }} dense>
              <ListItem sx={{ display: 'list-item' }}>
                {t('pcu.connection.help.wlanStep1', 'wlanStep1')}
              </ListItem>
              <ListItem sx={{ display: 'list-item' }}>
                {t('pcu.connection.help.wlanStep2', 'wlanStep2')}
              </ListItem>
              <ListItem sx={{ display: 'list-item' }}>
                {t('pcu.connection.help.wlanStep3', 'wlanStep3')}
              </ListItem>
              <ListItem sx={{ display: 'list-item' }}>
                {t('pcu.connection.help.wlanStep4', 'wlanStep4')}
              </ListItem>
            </List>
            <Typography
              data-testid="section-title-lan"
              variant="body1"
              sx={(theme) => ({ color: theme.colors.primary_11 })}
            >
              {t('pcu.connection.help.wlan', 'lan')}
            </Typography>
            <List sx={{ listStyle: 'decimal', pl: 4 }} dense>
              <ListItem sx={{ display: 'list-item' }}>
                {t('pcu.connection.help.lanStep1', 'lanStep1')}
              </ListItem>
              <ListItem sx={{ display: 'list-item' }}>
                {t('pcu.connection.help.lanStep2', 'lanStep2')}
              </ListItem>
              <ListItem sx={{ display: 'list-item' }}>
                {t('pcu.connection.help.lanStep3', 'lanStep3')}
              </ListItem>
              <ListItem sx={{ display: 'list-item' }}>
                {t('pcu.connection.help.lanStep4', 'lanStep4')}
              </ListItem>
            </List>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  )
}
export default LanConnectionHelp
