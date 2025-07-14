/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, Slide } from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'
import { VideoPlayer } from 'components/molecules/VideoPlayer/VideoPlayer'
import { Icon } from 'components/atoms/Icon/Icon'
import style from './LoginInfo.module.scss'

export interface ILoginInfoProps {}

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
 * Display user options and present a CTA to show introductory video
 */
export const LoginInfo: FC<ILoginInfoProps> = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState<boolean>(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <div className={style.container}>
        <span>{t('login.info.watch', 'Watch')}</span>
        <Icon name="Play" className={style.play} onClick={handleClickOpen} />
      </div>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <VideoPlayer url="assets/videos/Example.mp4" onClose={handleClose} />
      </Dialog>
    </>
  )
}
