/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, PropsWithChildren, useState } from 'react'
import { Icon } from 'components/atoms/Icon/Icon'
import { Dialog } from '@mui/material'
import { CloseButton } from 'components/atoms/CloseButton/CloseButton'
import classNames from 'classnames'
import style from './SidePanelMedia.module.scss'

export interface IImage {
  id: string
  title: string
  data: string
}

export interface ISidePanelMediaImageProps {
  images?: IImage[]
}

/**
 * List of notes in the Media Side Panel
 */
export const SidePanelMediaImage: FC<ISidePanelMediaImageProps> = ({
  images,
}: PropsWithChildren<ISidePanelMediaImageProps>) => {
  const [open, setOpen] = useState<boolean>(false)
  const [fullscreenImage, setFullscreenImage] = useState<string>('')

  const handleClose = () => {
    setOpen(false)
  }

  function expandImage(imageData: string) {
    setFullscreenImage(imageData)
    setOpen(true)
  }

  return (
    <ul className={style.list}>
      <Dialog fullScreen open={open} onClose={handleClose} hideBackdrop={true}>
        <div className={style.fullscreenContainer}>
          <img
            className={style.fullscreenImage}
            src={fullscreenImage}
            alt="visual annotation"
          />
          <div className={style.closeButton}>
            <CloseButton onClick={handleClose} />
          </div>
        </div>
      </Dialog>
      {images?.map((image) => (
        <li key={image.id} className={style.annotation}>
          <img
            className={style.content}
            src={image.data}
            alt="visual annotation"
          />
          <div className={style.annotationFooter}>
            <h3 className={style.title}>{image.title}</h3>
            <Icon
              name="Fullscreen"
              className={style.icon}
              onClick={() => expandImage(image.data)}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
