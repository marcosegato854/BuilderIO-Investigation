/* eslint-disable react/no-danger */
import React, { FC, PropsWithChildren, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Container, Fade, Grid, Popover, Typography } from '@mui/material'
import api from 'store/features/system/api'
import style from 'components/molecules/Copyright/Copyright.module.scss'
import { Lib } from 'store/features/system/types'
import { toLower, uniq } from 'ramda'
import { Icon } from 'components/atoms/Icon/Icon'
import { useSelector } from 'react-redux'
import { selectSystemInfo } from 'store/features/system/slice'

export interface ICopyrightProps {
  onClose?: () => void
  versionInfo?: string
  pcuVersion?: boolean
}

/**
 * Copyright description
 */
export const Copyright: FC<ICopyrightProps> = ({
  onClose,
  versionInfo,
  pcuVersion = false,
}: PropsWithChildren<ICopyrightProps>) => {
  const anchorEl = document.getElementById('hamburgerMenu')
  const { t } = useTranslation()
  const [licenses, setLicenses] = useState<Lib[]>()
  const systemInfo = useSelector(selectSystemInfo)
  const installerVersion = systemInfo?.installerversion

  // load licenses
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { libs },
      } = await api.systemLicenses()
      const uniqueValues = uniq(libs)
      const orderedValues = uniqueValues.sort((a, b) =>
        toLower(a.name) > toLower(b.name) ? 1 : -1
      )
      setLicenses(orderedValues)
    }
    fetchData()
  }, [])

  const copyrightBody = (
    <Container
      // className={pcuVersion ? style.pcucontainer : style.container}
      className={`${style.container} ${
        !pcuVersion ? style.popover : style.pcuadaptation
      }`}
      maxWidth={!pcuVersion ? 'sm' : undefined}
    >
      {!pcuVersion && (
        <div className={style.containerClose}>
          {/* <Close onClick={onClose} /> */}
          <Icon name="Close" onClick={onClose} />
        </div>
      )}
      <Grid
        container
        direction="column"
        alignItems="stretch"
        justifyContent="center"
      >
        {!pcuVersion ? (
          <Grid className={style.header}>
            <Icon name="Copyright" />
            <h5>{t('copyright.title', 'copyright')}</h5>
          </Grid>
        ) : (
          <Grid item>
            <div>
              {t('firmwareUpdate.version', 'firmware version')}:{' '}
              {installerVersion}
            </div>
          </Grid>
        )}
        <Grid
          container
          item
          direction="row"
          alignContent="center"
          alignItems="flex-start"
          className={style.text}
          mb="16px"
        >
          <div
            dangerouslySetInnerHTML={{
              __html: t('copyright.text', 'copyright Leica Geosystems AG', {
                year: new Date().getFullYear(),
              }),
            }}
          />
        </Grid>
        <Grid
          container
          item
          direction="row"
          alignContent="center"
          alignItems="flex-start"
          className={style.content}
        >
          <Grid container direction="row" alignItems="flex-start" padding="4px">
            <Grid item xs={6}>
              {t('copyright.library', 'library')}
            </Grid>
            <Grid item xs={6}>
              {t('copyright.url', 'url')}
            </Grid>
          </Grid>
          <div className={style.scrollable}>
            {licenses &&
              licenses.map((license, index) => {
                return (
                  <Grid
                    container
                    spacing={2}
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${license.name}-${index}`}
                  >
                    <Grid item xs={6}>
                      <Typography className={style.typography} noWrap={true}>
                        {license.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography className={style.typography} noWrap={true}>
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={license.url}
                        >
                          {license.url}
                        </a>
                      </Typography>
                    </Grid>
                  </Grid>
                )
              })}
          </div>
        </Grid>
        <Grid
          item
          container
          className={style.footer}
          alignItems="flex-start"
          justifyContent="flex-start"
        >
          <span>{versionInfo}</span>
        </Grid>
      </Grid>
    </Container>
  )

  const copyrightPopover = (
    <Popover
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      anchorEl={anchorEl || undefined}
      onClose={onClose}
      open
      TransitionComponent={Fade}
    >
      {copyrightBody}
    </Popover>
  )

  return !pcuVersion ? copyrightPopover : copyrightBody
}
