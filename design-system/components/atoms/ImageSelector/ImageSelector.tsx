/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { FC, PropsWithChildren } from 'react'
import Photo from 'assets/png/Photo.png'
import classNames from 'classnames'
import {
  imageProcessor,
  resize,
  ResizeOptions,
  sharpen,
} from 'ts-image-processor'
import style from 'components/atoms/ImageSelector/ImageSelector.module.scss'

export interface IImageSelectorProps {
  /**
   * Data URL of the image
   */
  image?: string
  onChange?: (img: string) => void
  constraints?: ResizeOptions
}

/**
 * ImageSelector description
 */
export const ImageSelector: FC<IImageSelectorProps> = ({
  image,
  onChange,
  constraints = { maxWidth: 720, maxHeight: 540 },
}: PropsWithChildren<IImageSelectorProps>) => {
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = async (ev: ProgressEvent<FileReader>) => {
        if (!ev.target) return
        if (typeof ev.target.result === 'string') {
          const resized = await imageProcessor
            .src(ev.target.result)
            .pipe(resize(constraints), sharpen())
          onChange && onChange(resized)
          // onChange && onChange(ev.target.result)
        } else {
          console.error('image data URL must be a string')
        }
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  return (
    // In order to select a file whenever we click on the camera pic/image,
    // we need to have an input with type = "file" and link it to a label via an id.
    // Then we need to put the <img> inside of the <label> and hide the <input> thanks to SCSS
    // We cannot directly the <img> with the <input> because that's not supported

    <div className={style.imageSelector}>
      <label htmlFor="uploadButton">
        <img
          // if image exist choose it, otherwise choose Photo
          // it's the same as writing image ? image : Photo
          src={image || Photo}
          alt="selected img"
          className={classNames({
            [style.photoSelected]: image,
            [style.photoUnselected]: !image,
          })}
        />
        {image && (
          <img
            alt="button overlay"
            src={Photo}
            className={style.photoOverlay}
          />
        )}
      </label>
      <input
        id="uploadButton"
        className={style.uploadButton}
        type="file"
        accept="image/*"
        // capture // uncomment to force using camera
        onChange={handlePhotoChange}
      />
    </div>
  )
}
