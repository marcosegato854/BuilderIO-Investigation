/* eslint-disable jsx-a11y/click-events-have-key-events */
import { AudioPlayer } from 'components/atoms/AudioPlayer/AudioPlayer'
import React, { FC, PropsWithChildren } from 'react'
import style from './SidePanelMedia.module.scss'

export interface ISound {
  id: string
  title: string
  sound: string
}

export interface ISidePanelMediaAudioProps {
  recordings?: ISound[]
}

/**
 * List of notes in the Media Side Panel
 */
export const SidePanelMediaAudio: FC<ISidePanelMediaAudioProps> = ({
  recordings,
}: PropsWithChildren<ISidePanelMediaAudioProps>) => {
  return (
    <ul className={style.list}>
      {/* Using recordings instead of audios because the latter is not that commonly used */}
      {recordings?.map((recording) => (
        <li key={recording.id} className={style.annotation}>
          <div className={style.audioBox}>
            <AudioPlayer src={recording.sound} />
          </div>

          <div className={style.annotationFooter}>
            <h3 className={style.title}>{recording.title}</h3>
          </div>
        </li>
      ))}
    </ul>
  )
}
