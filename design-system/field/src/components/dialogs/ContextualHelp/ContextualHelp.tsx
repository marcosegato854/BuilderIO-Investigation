/* eslint-disable react/no-danger */
import classNames from 'classnames'
import { CloseButton } from 'components/atoms/CloseButton/CloseButton'
import React, { FC, PropsWithChildren } from 'react'
import style from './ContextualHelp.module.scss'

export interface IContextualHelpProps {
  /**
   * Title
   */
  title: string
  /**
   * Type of help
   */
  $type: 'Image' | 'Text'
  /**
   * Image src
   */
  $imageURL?: string
  /**
   * Text
   */
  text?: string
  /**
   * Close handler
   */
  onClose?: React.MouseEventHandler<SVGSVGElement>
}

/**
 * ContextualHelp description
 */
const ContextualHelp: FC<IContextualHelpProps> = ({
  title,
  $type,
  $imageURL,
  text,
  onClose,
}: PropsWithChildren<IContextualHelpProps>) => {
  return (
    <div
      className={classNames({
        [style.container]: true,
        [style[`container${$type}`]]: true,
      })}
    >
      <div className={style.header}>
        <div className={style.title}>{title}</div>
        <div className={style.close}>
          <CloseButton onClick={onClose!} />
        </div>
      </div>
      <div className={style.content}>
        {$type === 'Image' && $imageURL && <img src={$imageURL} alt="help" />}
        {$type === 'Text' && text && (
          <div dangerouslySetInnerHTML={{ __html: text }} />
        )}
      </div>
    </div>
  )
}
export default ContextualHelp
