/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, PropsWithChildren } from 'react'
import { Icon } from 'components/atoms/Icon/Icon'
import classNames from 'classnames'
import style from './SidePanelMedia.module.scss'

export interface INote {
  id: string
  title: string
  content: string
}

export interface ISidePanelMediaTextProps {
  notes?: INote[]
}

/**
 * List of notes in the Media Side Panel
 */
export const SidePanelMediaText: FC<ISidePanelMediaTextProps> = ({
  notes,
}: PropsWithChildren<ISidePanelMediaTextProps>) => {
  return (
    <ul className={style.list}>
      {notes?.map((note) => (
        <li key={note.id} className={style.annotation}>
          <p
            className={classNames({
              [style.content]: true,
              [style.text]: true,
            })}
          >
            {note.content}
          </p>
          <div className={style.annotationFooter}>
            <h3 className={style.title}>{note.title}</h3>
            <Icon
              name="Edit"
              className={style.icon}
              onClick={() => console.info('Edit clicked')}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
