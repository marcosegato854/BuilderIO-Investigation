import React, { FC, useState, useCallback, createRef } from 'react'
import { Button, Slide, Dialog, Snackbar } from '@mui/material'
import Alert from '@mui/lab/Alert'
import { TransitionProps } from '@mui/material/transitions'
import { useTranslation } from 'react-i18next'
import QrReader from 'react-qr-reader'
import { Icon } from 'components/atoms/Icon/Icon'
import { useDispatch } from 'react-redux'
import { loginActions } from 'store/features/auth/slice'
import classNames from 'classnames'
import { LoginPayload } from 'store/features/auth/types'
import { getIpFromUrl } from 'utils/getIpFromUrl'
import style from './QrCodeReader.module.scss'

export interface IQrCodeReaderProps {}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

/**
 * QrCodeReader description
 */
export const QrCodeReader: FC<IQrCodeReaderProps> = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [legacy, setLegacy] = useState(false)
  const dispatch = useDispatch()
  const qrc = createRef<QrReader>()
  const currentIp = getIpFromUrl()

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const onReading = useCallback(
    (values: LoginPayload) => {
      dispatch(loginActions.request(values))
    },
    [dispatch]
  )

  const handleError = () => {
    /* console.error(err) */
    setLegacy(true)
  }

  /* This could be improved using 'react-router-dom */
  const handleScan = (data: string | null) => {
    if (data) {
      const qrcodeIp = getIpFromUrl(data)
      const credentials = data.split('/')
      const user = credentials[credentials.length - 2]
      const pass = credentials[credentials.length - 1]
      const login: LoginPayload = {
        username: user,
        password: pass,
        rememberMe: true,
      }
      if (qrcodeIp !== currentIp) {
        /* If the ip is different redirect to new url */
        window.location.replace(data)
      } else onReading(login)
    }
  }

  const openImageDialog = () => {
    if (qrc.current) {
      qrc.current.openImageDialog()
    }
  }

  return (
    <>
      <div className={style.qrcode}>
        <p>{t('login.form.qrcode', 'Scan QR code')}</p>
        <Button variant="text" onClick={handleClickOpen}>
          <Icon name="QrCode" />
        </Button>
      </div>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        className={style.dialog}
      >
        <div className={style.qrcodeContainer}>
          <div className={style.qrcodeHeader}>
            {t('login.form.qrcodeReader', 'Scan QR code')}
          </div>
          <div className={style.qrcodeClose}>
            <Button onClick={handleClose}>
              <Icon name="Close" />
            </Button>
          </div>
          <QrReader
            ref={qrc}
            delay={500}
            onError={handleError}
            onScan={handleScan}
            className={classNames({
              [style.qrcodeReader]: true,
              [style.qrcodeLegacy]: legacy,
            })}
            legacyMode={legacy}
          />
        </div>
        {legacy && (
          <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            open
          >
            <Alert
              variant="filled"
              severity="error"
              action={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <Button color="primary" size="small" onClick={openImageDialog}>
                  {t('login.form.loadPicture', 'Load a picture')}
                </Button>
              }
            >
              {t(
                'login.form.qrcodeLegacy',
                'Camera is not responding, load a picture'
              )}
            </Alert>
          </Snackbar>
        )}
      </Dialog>
    </>
  )
}
