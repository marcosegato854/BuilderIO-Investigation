import React, { FC, PropsWithChildren } from 'react'
import ReactH5AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/src/styles.scss'
import './AudioPlayer.module.scss'

export interface IAudioPlayerProps {
  // URL of the audio source
  src: string
}

/**
 * Component used for playing audio
 */
export const AudioPlayer: FC<IAudioPlayerProps> = ({
  src,
}: PropsWithChildren<IAudioPlayerProps>) => {
  return (
    <ReactH5AudioPlayer
      src={src}
      layout="stacked-reverse"
      customVolumeControls={[]}
      customAdditionalControls={[]}
      // onPlay={(e) => console.log('onPlay')}
      // other props here
    />
  )
}
