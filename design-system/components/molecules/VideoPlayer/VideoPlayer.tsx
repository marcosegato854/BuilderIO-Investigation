import { styled } from '@mui/material'
import Slider from '@mui/material/Slider'
import { Icon } from 'components/atoms/Icon/Icon'
import React, { FC, PropsWithChildren, useRef, useState } from 'react'
import ReactPlayer from 'react-player'
import { format } from 'utils/time'
import style from './VideoPlayer.module.scss'

const PlayerSlider = styled(Slider)(({ theme }) => ({
  height: 8,
  '& .MuiSlider-track': {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.secondary_8,
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: 'transparent',
    marginTop: -8,
    marginLeft: -12,
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
  },
  '& .MuiSlider-rail': {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary_11,
  },
  '& .MuiSlider-valueLabel': {
    left: 'calc(-50% + 4px)',
  },
}))

export interface IVideoPlayerProps {
  url: string
  onClose?: CustomHandler
}

/**
 * VideoPlayer description
 */
export const VideoPlayer: FC<IVideoPlayerProps> = ({
  url,
  onClose,
}: PropsWithChildren<IVideoPlayerProps>) => {
  // state values can be: playing to set if it's playing initially, muted to mute the video, volume value from 0 to 1, played value from 0 to 1, and seeking that is changed when clicking on the seekbar
  const [state, setState] = useState({
    playing: true,
    muted: false,
    volume: 1,
    played: 0,
    seeking: false,
  })
  const [visible, setVisible] = useState(true)
  // playeref is passed in the ReactPlayer component and is used to change the time of the video
  const playerRef = useRef<ReactPlayer>(null)
  const handleCloseClick = () => (onClose ? onClose() : setVisible(false))
  // when clicked pause or play change the value of playing
  const handlePlayPause = () => {
    setState({ ...state, playing: !state.playing })
  }
  // on rewing go back by 10 seconds
  const handleRewind = () => {
    playerRef.current?.seekTo(playerRef.current.getCurrentTime() - 10)
  }
  // on fastforward go forward by 10 seconds
  const handleFastForward = () => {
    playerRef.current?.seekTo(playerRef.current.getCurrentTime() + 10)
  }
  // when clicked on the mute icon change the value of muted
  const handleMuted = () => {
    setState({ ...state, muted: !state.muted })
  }
  // volume accepts a value from 0 to 1 so we have to divide by 100 the new value, if the new value is 0 mute the player
  const handleVolumechange = (e: Event, newValue: number | number[]) => {
    if (typeof newValue !== 'number') return
    setState({
      ...state,
      volume: parseFloat(String(newValue / 100)),
      muted: newValue === 0,
    })
  }
  // every n seconds update the state (so the played value, which is used for the seekbar, will be changed) unless it's seeking
  const handleProgress = (changeState: {
    loaded: number
    loadedSeconds: number
    played: number
    playedSeconds: number
  }) => {
    if (!state.seeking) setState({ ...state, ...changeState })
  }
  const handleSeekChange = (e: Event, newValue: number | number[]) => {
    if (typeof newValue !== 'number') return
    setState({ ...state, played: parseFloat(String(newValue / 100)) })
  }
  const handleSeekMouseDown = () => {
    setState({ ...state, seeking: true })
  }
  const handleSeekMouseUp = (
    e: React.SyntheticEvent | Event,
    newValue: number | number[]
  ) => {
    if (typeof newValue !== 'number') return
    setState({ ...state, seeking: false })
    playerRef.current?.seekTo(newValue / 100)
  }
  // get the current time
  const currentTime = playerRef.current ? playerRef.current.getCurrentTime() : 0 // : '00:00' // davide version
  // get the video duration
  const duration = playerRef.current ? playerRef.current.getDuration() : 0 // : '00:00' // davide version
  // get the current time formatted
  const elapsedTime = format(currentTime)
  // get the video duration formatted
  const totalDuration = format(duration)

  return visible ? (
    <div className={style.videoPlayer}>
      {/* video player */}
      <ReactPlayer
        onProgress={handleProgress}
        volume={state.volume}
        ref={playerRef}
        muted={state.muted}
        playing={state.playing}
        url={url}
        width="100%"
        height="100%"
      />
      <div className={style.videoPlayer__topGradient} />
      {/* video close button */}
      <Icon
        name="Close"
        onClick={handleCloseClick}
        className={style.videoPlayer__playerClose}
      />
      {/* video title */}
      <h2 className={style.videoPlayer__playerTitle}>
        Tour Eiffel, Paris France
      </h2>
      <div className={style.videoPlayer__controlsWrapper}>
        {/* seekbar */}
        <PlayerSlider
          onChange={handleSeekChange}
          onMouseDown={handleSeekMouseDown}
          onChangeCommitted={handleSeekMouseUp}
          min={0}
          max={100}
          value={state.played * 100}
        />
        {/* video controls under the seekbar */}
        <div className={style.videoPlayer__controls}>
          <Icon
            name="ControlBack"
            onClick={handleRewind}
            className={style.videoPlayer__controlBack}
          />
          {state.playing ? (
            <Icon
              name="ControlPause"
              onClick={handlePlayPause}
              className={style.videoPlayer__controlPause}
            />
          ) : (
            <Icon
              name="ControlPlay"
              onClick={handlePlayPause}
              className={style.videoPlayer__controlPlay}
            />
          )}
          <div className={style.videoPlayer__controlTime}>
            {elapsedTime}/{totalDuration}
          </div>
          <Icon
            name="ControlForward"
            onClick={handleFastForward}
            className={style.videoPlayer__controlForward}
          />
          {state.muted ? (
            <Icon
              name="Mute"
              onClick={handleMuted}
              className={style.videoPlayer__controlVolumeOff}
            />
          ) : (
            <Icon
              name="ControlVolume"
              onClick={handleMuted}
              className={style.videoPlayer__controlVolumeOn}
            />
          )}
          <Slider
            onChange={handleVolumechange}
            className={style.videoPlayer__controlVolumeSlider}
            min={0}
            max={100}
            value={state.volume * 100}
          />
        </div>
      </div>
    </div>
  ) : null
}
